import { headers } from "next/headers";
import { Sidebar } from "@/components/ui/Sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar session={session} />

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
 