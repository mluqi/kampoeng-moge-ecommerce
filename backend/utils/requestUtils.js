function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return forwarded
    ? forwarded.split(",")[0]
    : req.connection.remoteAddress || "IP tidak dikenali";
}

function getClientBrowser(userAgent) {
  if (userAgent.includes("Netscape")) return "Netscape";
  else if (userAgent.includes("Firefox")) return "Firefox";
  else if (userAgent.includes("Chrome")) return "Chrome";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR"))
    return "Opera";
  else if (userAgent.includes("MSIE") || userAgent.includes("Trident"))
    return "Internet Explorer";
  else if (userAgent.includes("Safari")) return "Safari";
  else return "Other";
}

module.exports = { getClientIp, getClientBrowser };
