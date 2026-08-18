import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <SiteHeader />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default SiteLayout;
