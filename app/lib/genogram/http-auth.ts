export function isAuthorized(request: Request): boolean {
  const token = process.env.GENOGRAM_API_TOKEN;
  if (!token) return true;
  const auth = request.headers.get('authorization') || '';
  const apiKey = request.headers.get('x-api-key') || '';
  return auth === `Bearer ${token}` || apiKey === token;
}
