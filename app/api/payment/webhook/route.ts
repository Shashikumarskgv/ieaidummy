import { NextRequest, NextResponse } from "next/server";

/**
 * Zoho Payment Webhook Endpoint
 *
 * Domain: https://ieai.dataquotes.net
 * Fixed Webhook URL: https://ieai.dataquotes.net/api/payment/webhook
 *
 * Description: Production-ready endpoint for receiving and processing
 * payment notifications from Zoho Payment Gateway.
 */

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return NextResponse.json({ success: false, message: "Payment API is not configured." }, { status: 500 });
    const signature = req.headers.get("x-zoho-signature") || req.headers.get("x-webhook-signature") || req.headers.get("x-signature");
    const apiBase = apiUrl.replace(/\/$/, "").replace(/\/api$/, "");
    const upstream = await fetch(`${apiBase}/api/finance/webhook/zoho`, {
      method: "POST",
      headers: { "content-type": req.headers.get("content-type") || "application/json", ...(signature ? { "x-zoho-signature": signature } : {}) },
      body: rawBody,
      cache: "no-store"
    });
    const responseBody = await upstream.text();
    return new NextResponse(responseBody, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") || "application/json" } });
  } catch (error) {
    // Log exception / JSON parse failure
    console.error("[Zoho Webhook] Invalid payload error:", error);

    // Return failure response (HTTP 400)
    return NextResponse.json(
      {
        success: false,
        message: "Invalid payload"
      },
      { status: 400 }
    );
  }
}
