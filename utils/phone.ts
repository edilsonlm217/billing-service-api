export function normalizePhone(phone: string): string {
  return phone.length === 13
    ? phone.slice(0, 4) + phone.slice(5)
    : phone;
}
