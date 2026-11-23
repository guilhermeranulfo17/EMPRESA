import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "@/components/Sobre";
import Edicao from "@/components/Edicao";
import ODia from "@/components/ODia";
import NaRua from "@/components/NaRua";
import ParaQuem from "@/components/ParaQuem";
import Speakers from "@/components/Speakers";
import Testimonials from "@/components/Testimonials";
import Groups from "@/components/Groups";
import Enrollment from "@/components/Enrollment";
import Faq from "@/components/Faq";
import Encerramento from "@/components/Encerramento";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import MobileCTA from "@/components/MobileCTA";
import AdminPanel from "@/pages/AdminPanel";
import Lideres from "@/pages/Lideres";
import Responsaveis from "@/pages/Responsaveis";
import School from "@/pages/School";
import { scrollToId } from "@/lib/scroll";
import { guardarOrigem } from "@/lib/origem";
import { iniciarRastreio } from "@/lib/rastreio";

function Inicio() {
  useEffect(() => {
    document.title = "Outside Experience | A fé não foi feita para ficar dentro";
    if (window.location.hash) {
      const t = setTimeout(() => scrollToId(window.location.hash), 300);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen bg-ink text-white">
      <Header />
      <main>
        <Hero />
        <Sobre />
        <Edicao />
        <ODia />
        <NaRua />
        <ParaQuem />
        <Speakers />
        <Testimonials />
        <Groups />
        <Enrollment />
        <Faq />
        <Encerramento />
      </main>
      <Footer />
      <WhatsAppFloat />
      <MobileCTA />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    guardarOrigem();
    if (!window.location.pathname.startsWith("/admin")) iniciarRastreio();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/lideres" element={<Lideres />} />
        <Route path="/responsaveis" element={<Responsaveis />} />
        <Route path="/school" element={<School />} />
        <Route path="*" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}
