import Footer from "@/components/footer";
import NavBar from "@/components/navBar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavBar />
      <Toaster richColors position="top-right" />
      <div className="min-h-screen">{children}</div>

      <Footer />
    </div>
  );
}
