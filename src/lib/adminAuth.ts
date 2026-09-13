// Lightweight admin gate for the CMS. Not a user-account system — a single
// shared password (ADMIN_PASSWORD) sent as a header from the admin page.
export function isAdmin(req: Request): boolean {
  const provided = req.headers.get('x-admin-password') ?? ''
  const expected = process.env.ADMIN_PASSWORD ?? ''
  return expected.length > 0 && provided === expected
}
