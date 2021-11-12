export function jwtCookieExtrator(req: any): string | null {
  return req?.cookies?.jwt;
}
