import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

// Lê o QR do ingresso com a câmera e devolve o código (OE-XXXXXXXX).
export default function LeitorQR({ onCodigo, onFechar }) {
  const videoRef = useRef(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ultimo = "";
    const scanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        const codigo = (data || "").trim().toUpperCase();
        if (!/^OE-?[0-9A-F]{8}$/.test(codigo) || codigo === ultimo) return;
        ultimo = codigo;
        if (navigator.vibrate) navigator.vibrate(80);
        onCodigo(codigo);
        setTimeout(() => (ultimo = ""), 3000);
      },
      { preferredCamera: "environment", highlightScanRegion: true, maxScansPerSecond: 5, returnDetailedScanResult: true },
    );
    scanner.start().catch(() => setErro("Não deu para abrir a câmera. Libere o acesso à câmera no navegador ou digite o código."));
    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [onCodigo]);

  return (
    <div className="space-y-3" data-testid="qr-reader">
      <div className="relative overflow-hidden bg-black">
        <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      </div>
      {erro && <p className="text-sm text-red-300">{erro}</p>}
      <button onClick={onFechar} className="w-full border border-white/15 py-3 text-xs uppercase tracking-widest text-white/80 hover:text-white">
        Fechar câmera
      </button>
    </div>
  );
}
