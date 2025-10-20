import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <section className="container mx-auto p-4">{children}</section>;
}
