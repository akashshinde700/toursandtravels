import { SmoothScroll } from "@/components/smooth-scroll";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollCar } from "@/components/scroll-car";
import { ContentProvider } from "@/components/content-provider";
import { Tracker } from "@/components/tracker";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getContent, isPreviewing } from "@/lib/content";

// Public site chrome. /admin sits outside this group, so it gets none of it.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentProvider value={await getContent()}>
      <SmoothScroll />
      <ScrollCar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
      <Tracker />
      {(await isPreviewing()) && (
        <a href="/admin" className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink shadow-xl">
          Preview — unsaved changes, visitors can't see these yet
        </a>
      )}
    </ContentProvider>
  );
}
