import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Workspace } from "@/components/workspace";
import LandingPage from "@/components/landing/landing-page";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return <Workspace userId={user.id} userEmail={user.email ?? ""} />;

  return <LandingPage />;
}
