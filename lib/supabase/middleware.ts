import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware: Processing request for", request.nextUrl.pathname)

  try {
    // Allow all requests to pass through
    // Authentication will be checked in individual pages/layouts instead
    const response = NextResponse.next({
      request,
    })

    console.log("[v0] Middleware: Request allowed")
    return response
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // In case of any error, allow the request to continue
    return NextResponse.next({
      request,
    })
  }
}
