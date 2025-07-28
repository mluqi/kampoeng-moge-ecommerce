const { Order, OrderItem, Product, sequelize } = require("../models");
const { generateAwbForOrder } = require("./shippingController");

const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN;

exports.handleXenditWebhook = async (req, res) => {
  try {
    // 1. Verifikasi X-Callback-Token (opsional tapi disarankan)
    const xCallbackToken = req.headers["x-callback-token"];
    if (xCallbackToken !== XENDIT_CALLBACK_TOKEN) {
      return res.status(401).send("Invalid webhook token");
    }

    const data = req.body;

    console.log(
      `Received Xendit webhook for invoice: ${data.id}, status: ${data.status}`
    );

    // 2. Validasi data penting
    if (!data.external_id || !data.paid_amount) {
      console.error("Webhook Error: Missing external_id or paid_amount");
      return res.status(400).send("Invalid webhook payload");
    }

    // 3. Hanya proses status PAID atau SETTLED
    const status = data.status?.toLowerCase();
    if (status === "paid" || status === "settled") {
      const orderId = data.external_id;
      const paidAmount = parseFloat(data.paid_amount ?? 0);

      const t = await sequelize.transaction();
      try {
        const order = await Order.findOne({
          where: { order_id: orderId },
          // Include items and products for AWB generation
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [{ model: Product, as: "product" }],
            },
          ],
          transaction: t,
        });

        if (!order) {
          console.error(`Webhook Error: Order with ID ${orderId} not found.`);
          await t.rollback();
          return res.status(404).send("Order not found");
        }

        if (
          order.status === "pending" &&
          parseFloat(order.total_amount) === paidAmount
        ) {
          order.status = "processing";
          // order.payment_method = data.payment_method;
          await order.save({ transaction: t });
          console.log(`Order ${orderId} status updated to processing.`);

          // --- GENERATE AWB OTOMATIS ---
          try {
            await generateAwbForOrder(order, t);
          } catch (awbError) {
            // Jika gagal, jangan batalkan transaksi.
            // Biarkan status order tetap 'processing' agar bisa di-handle manual.
            console.error(
              `Could not automatically generate AWB for order ${orderId}. It needs to be generated manually. Reason:`,
              awbError.message
            );
          }
        } else {
          console.warn(
            `Webhook skipped for order ${orderId}. Status: ${
              order.status
            }, Amount match: ${parseFloat(order.total_amount) === paidAmount}`
          );
        }

        await t.commit();
      } catch (error) {
        await t.rollback();
        console.error(`Error processing webhook for order ${orderId}:`, error);
      }
    } else {
      console.log(
        `Webhook received but status is ${data.status}, not processing.`
      );
    }

    return res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return res.status(500).send("Internal Server Error");
  }
};
