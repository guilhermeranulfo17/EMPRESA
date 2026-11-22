import { useEffect } from "react";
import "@/App.css";
import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import AboutEvent from "@/components/AboutEvent";
import Moments from "@/components/Moments";
import Statement from "@/components/Statement";
import Program from "@/components/Program";
import Envio from "@/components/Envio";
import FieldSteps from "@/components/FieldSteps";
import Proof from "@/components/Proof";
import Groups from "@/components/Groups";
import ForWho from "@/components/ForWho";
import Speakers from "@/components/Speakers";
import Testimonials from "@/components/Testimonials";
import Enrollment from "@/components/Enrollment";
import Faq from "@/components/Faq";
import FinalCTA from "@/components/FinalCTA";
import NextStep from "@/components/NextStep";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import MobileCTA from "@/components/MobileCTA";
import AdminPanel from "@/pages/AdminPanel";
import { scrollToId } from "@/lib/scroll";
import { guardarOrigem } from "@/lib/origem";

function HomePage() {
  useEffect(() => {
    guardarOrigem();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let frame = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const t = setTimeout(() => scrollToId(window.location.hash), 400);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">
      <ScrollProgress />
      <Header />
      <main>
        <Hero ready />
        <Marquee />
        <AboutEvent />
        <Proof />
        <Moments />
        <Statement />
        <Program />
        <Envio />
        <FieldSteps />
        <ForWho />
        <Speakers />
        <Testimonials />
        <Groups />
        <Enrollment />
        <Faq />
        <FinalCTA />
        <NextStep />
      </main>
      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      <MobileCTA />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
