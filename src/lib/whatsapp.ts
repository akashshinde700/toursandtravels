// WhatsApp chat link from however a number was typed: "+91 93221 87365", "093221-87365" and
// "9322187365" all become wa.me/919322187365 (10-digit Indian numbers get the 91 country code).
export function waLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "").replace(/^0/, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
