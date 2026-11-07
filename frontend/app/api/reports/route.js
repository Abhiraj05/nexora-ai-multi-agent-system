import { NextResponse } from "next/server";

async function proxyReports(request, method) {
  const backend = process.env.BACKEND_API_URL;
  if (!backend) {
    return NextResponse.json(
      { detail: "Configure BACKEND_API_URL to connect to the backend." },
      { status: 503 },
    );
  }

  const headers = {
    Authorization: request.headers.get("authorization") || "",
  };
  const options = { method, headers };
  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    options.body = await request.text();
  }

  try {
    const response = await fetch(
      `${backend.replace(/\/$/, "")}/reports`,
      options,
    );
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "Could not connect to the reports service." },
      { status: 502 },
    );
  }
}

export async function GET(request) {
  return proxyReports(request, "GET");
}

export async function POST(request) {
  return proxyReports(request, "POST");
}
