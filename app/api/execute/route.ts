import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const apiUrl = rawUrl.trim().replace(/\/+$/, "");

    const response = await axios.post(
      `${apiUrl}/compiler/run`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Sandbox compiler service is unavailable.",
        error: error.message || "Failed to communicate with execution backend API.",
      },
      { status: 503 }
    );
  }
}
