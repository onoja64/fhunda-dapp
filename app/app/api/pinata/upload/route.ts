import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
  const PINATA_JWT = process.env.PINATA_JWT;

  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
    return NextResponse.json(
      { error: "Pinata not configured on server" },
      { status: 500 }
    );
  }

  try {
    // Forward the multipart/form-data request body and content-type header
    const contentType = req.headers.get("content-type") || "";
    const bodyArrayBuffer = await req.arrayBuffer();

    const headers: Record<string, string> = {};
    if (contentType) headers["content-type"] = contentType;

    if (PINATA_JWT) {
      headers["Authorization"] = `Bearer ${PINATA_JWT}`;
    } else {
      headers["pinata_api_key"] = PINATA_API_KEY!;
      headers["pinata_secret_api_key"] = PINATA_API_SECRET!;
    }

    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers,
        // node-fetch / undici accepts ArrayBuffer / Buffer
        body: Buffer.from(bodyArrayBuffer),
      }
    );

    const text = await pinataRes.text();
    const contentTypeResp =
      pinataRes.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: pinataRes.status,
      headers: { "Content-Type": contentTypeResp },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
