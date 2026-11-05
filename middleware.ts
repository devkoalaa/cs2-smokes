import { NextRequest, NextResponse } from 'next/server';

// A implantação antiga na Vercel serve apenas como ponte para o servidor próprio.
export function middleware(request: NextRequest) {
  if (process.env.VERCEL === '1') {
    return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://cs2.devkoala.com'), 307);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
