import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Eğer istek /cart rotasındaysa ve POST ise, 303 yönlendirmesi yap
  //   if (req.nextUrl.pathname === "/cart" && req.method === "POST") {
  //     const url = req.nextUrl.clone();
  //     return NextResponse.redirect(url, 303); // 303: POST → GET
  //   }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
