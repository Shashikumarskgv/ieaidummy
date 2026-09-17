import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawApiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
    const backendUrl = rawApiUrl.startsWith("http") ? rawApiUrl : "http://localhost:5000/api";
    
    // Forward authorization header if present
    const authHeader = request.headers.get("authorization") || "";

    const response = await fetch(`${backendUrl}/exams/hod/ai-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        type: body.questionType === "STDIN" ? "mcq" : body.questionType === "FUNCTION" ? "coding" : "mixed",
        topic: body.topic,
        difficulty: (body.difficulty || "medium").toLowerCase(),
        count: body.questionCount || 5,
        languages: body.languages || ["python", "sql"],
      }),
    });

    const responseText = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { success: false, error: `Backend API Error (${response.status}): ${responseText.slice(0, 150)}` },
        { status: response.status || 500 }
      );
    }

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || "Failed to generate AI questions." },
        { status: response.status || 500 }
      );
    }

    const rawData = data.data || [];
    const mcqQuestions = rawData.filter((q: any) => q.type === "mcq" || (q.question && Array.isArray(q.options) && q.options.length >= 2 && q.type !== "coding"));
    const codingQuestions = rawData.filter((q: any) => q.type === "coding" || (!q.options && (q.statement || q.title)));

    return NextResponse.json({
      success: true,
      result: {
        questionSetId: 1,
        mcqQuestions,
        questions: codingQuestions,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
