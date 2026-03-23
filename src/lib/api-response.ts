import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function created(data: unknown) {
  return ok(data, 201);
}

export function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return err("Unauthorized", 401);
}

export function forbidden() {
  return err("Forbidden", 403);
}

export function notFound() {
  return err("Not found", 404);
}

export function rateLimited(resetAt: number) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
    }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.issues },
      { status: 400 }
    );
  }

  console.error("API error:", error);
  return err("Internal server error", 500);
}
