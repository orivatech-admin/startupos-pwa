import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect("/");
  }

  // Revocation-safe check: RLS on `profiles` only returns a row for
  // allowlisted users, so an empty result means access was revoked since
  // the session was issued.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/unauthorized");
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
      {children}
      {modal}
    </div>
  );
}
