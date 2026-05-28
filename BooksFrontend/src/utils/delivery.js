export function formatAddress(parts) {
  const address = parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

  if (!address) return "";

  return address.endsWith(".") ? address : `${address}.`;
}

export function getCheckoutDeliveryAddress(checkoutInfo, deliveryType) {
  if (deliveryType === "pickup") {
    return formatAddress([checkoutInfo.pickupPoint]);
  }

  return formatAddress([
    checkoutInfo.country,
    checkoutInfo.city,
    checkoutInfo.street,
    checkoutInfo.house,
    checkoutInfo.apartment,
  ]);
}
