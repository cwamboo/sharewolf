import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ url, label }: { url: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 320,
      color: { dark: "#07111F", light: "#F7FAFC" },
    })
      .then((d) => {
        if (alive) setSrc(d);
      })
      .catch(() => {
        if (alive) setSrc(null);
      });
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <section className="border border-mint/15 bg-ink/60 p-4">
      <h2 className="mb-3 border-l-2 border-coral pl-2 font-display text-xs uppercase">Join the race</h2>
      <div className="flex flex-col items-center gap-3">
        {src ? (
          <img src={src} alt={`QR code to ${url}`} className="w-full max-w-[11rem] border-4 border-cream" />
        ) : (
          <div className="grid w-full max-w-[11rem] aspect-square place-items-center border-4 border-dashed border-mint/40 p-4 text-center text-[10px] font-bold uppercase tracking-widest text-mint">
            {url}
          </div>
        )}
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-mint">{label}</p>
        <p className="break-all text-center text-[10px] font-semibold text-mint/70">{url.replace(/^https?:\/\//, "")}</p>
      </div>
    </section>
  );
}
