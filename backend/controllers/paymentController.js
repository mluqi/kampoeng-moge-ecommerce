const { Order, OrderItem, Product, sequelize } = require("../models");
const { generateAwbForOrder } = require("./shippingController");
const { syncStockToTiktok } = require("./productController");

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
    if (!data.external_id) {
      console.error("Webhook Error: Missing external_id");
      return res.status(400).send("Invalid webhook payload");
    }

    // 3. Proses status webhook
    const status = data.status?.toLowerCase();
    if (status === "paid" || status === "settled") {
      if (!data.paid_amount) {
        console.error(
          "Webhook Error: Missing paid_amount for PAID/SETTLED status"
        );
        return res
          .status(400)
          .send("Invalid webhook payload for PAID/SETTLED status");
      }

      const orderId = data.external_id;
      const paidAmount = parseFloat(data.paid_amount);

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
    } else if (status === "expired") {
      const orderId = data.external_id;
      const t = await sequelize.transaction();
      try {
        const order = await Order.findOne({
          where: { order_id: orderId },
          include: [
            {
              model: OrderItem,
              as: "items",
            },
          ],
          transaction: t,
        });

        if (!order) {
          console.error(
            `Webhook (EXPIRED) Error: Order with ID ${orderId} not found.`
          );
          await t.rollback();
          return res.status(404).send("Order not found");
        }

        // Hanya batalkan jika statusnya masih 'pending'
        if (order.status === "pending") {
          order.status = "cancelled";
          await order.save({ transaction: t });
          console.log(
            `Order ${orderId} status updated to cancelled due to expiration.`
          );

          const productsToSync = [];

          // Kembalikan stok produk
          for (const item of order.items) {
            const product = await Product.findByPk(item.product_id, {
              transaction: t,
            });
            if (product) {
              const newStock = product.product_stock + item.quantity;
              await product.update(
                { product_stock: newStock },
                { transaction: t }
              );
              console.log(
                `Stock for product ${item.product_id} restored to ${newStock}.`
              );

              productsToSync.push({
                productId: product.product_id,
                newStock: newStock,
              });
            }
          }

          await t.commit();

          // Sinkronkan stok ke TikTok setelah transaksi berhasil
          for (const p of productsToSync) {
            syncStockToTiktok(p.productId, p.newStock);
          }
        } else {
          console.warn(
            `Webhook (EXPIRED) skipped for order ${orderId}. Status is already '${order.status}'.`
          );
          await t.rollback(); // Tidak ada perubahan, rollback saja
        }
      } catch (error) {
        await t.rollback();
        console.error(
          `Error processing EXPIRED webhook for order ${orderId}:`,
          error
        );
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
