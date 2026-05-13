import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");

  if (error) {
    console.error("Auth callback error:", error, errorCode);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}&error_code=${errorCode}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Exchange error:", exchangeError);
    return NextResponse.redirect(`${origin}/login?error=auth_failed&error_description=${encodeURIComponent(exchangeError.message)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
