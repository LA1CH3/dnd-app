const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;

export function generateGroupId(): string {
  const values = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(values, (v) => CHARSET[v % CHARSET.length]).join('');
}
