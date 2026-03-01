import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Manager Dashboard | CAT Ready",
  description: "Fleet management and inspection monitoring dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {children}
    </div>
  );
}
