import crypto from "crypto";
import { NextResponse } from "next/server";

const USERNAME = process.env.SHOPIER_OSB_USERNAME!;
const SECRET_KEY = process.env.SHOPIER_OSB_SECRET_KEY!;

export async function POST(req: Request) {
  if (!USERNAME || !SECRET_KEY) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // 🔴 JSON DEĞİL! x-www-form-urlencoded olarak body'yi oku
  const formData = await req.formData();
  const encodedRes = formData.get("res")?.toString();
  const hash = formData.get("hash")?.toString();

  if (!encodedRes || !hash) {
    return new Response("missing parameter", { status: 400 });
  }

  const computedHash = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encodedRes + USERNAME)
    .digest("hex");

  if (computedHash !== hash) {
    return new Response("invalid hash", { status: 403 });
  }

  const decodedJson = Buffer.from(encodedRes, "base64").toString();
  const data = JSON.parse(decodedJson);
  const orderid = String(data.orderid);

  return NextResponse.json(
    {
      message: "ok",
      decodedJson,
      orderid,
      data,
    },
    {
      status: 200,
    }
  );
}
