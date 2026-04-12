"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Camera, Search, ShoppingBag, Sparkles, X,
  CheckCircle, ChevronDown, RotateCcw, Smartphone, Zap, Package,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = "idle" | "parsing" | "catalog" | "checkout";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  currency: string;
}

interface CheckoutState {
  product: Product | null;
  qty: number;
  phone: string;
  phoneError: string;
  step: "form" | "processing" | "success";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_TEXT = "Men's sneakers 3500, Leather belt 1200, Smartwatch 5k, Cap 800 – all in stock";

const UNSPLASH_MAP: Record<string, string> = {
  shoe:      "photo-1542291026-7eec264c27ff",
  sneaker:   "photo-1542291026-7eec264c27ff",
  boot:      "photo-1542291026-7eec264c27ff",
  belt:      "photo-1553062407-98eeb64c6a62",
  watch:     "photo-1523275335684-37898b6baf30",
  smartwatch:"photo-1523275335684-37898b6baf30",
  cap:       "photo-1588850561407-ed78c282e89b",
  hat:       "photo-1588850561407-ed78c282e89b",
  bag:       "photo-1553062407-98eeb64c6a62",
  dress:     "photo-1515886657613-9f3515b0c78f",
  shirt:     "photo-1489987707025-afc232f7ea0f",
  trouser:   "photo-1624378439575-d8705ad7ae80",
  jean:      "photo-1624378439575-d8705ad7ae80",
  phone:     "photo-1511707171634-5f897ff02aa9",
  laptop:    "photo-1496181133206-80ce9b88a853",
  perfume:   "photo-1541643600914-78b084683702",
  glasses:   "photo-1511499767150-a48a237f0083",
  default:   "photo-1542291026-7eec264c27ff",
};

function getProductImage(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, photoId] of Object.entries(UNSPLASH_MAP)) {
    if (lower.includes(keyword)) {
      return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=80`;
    }
  }
  return `https://images.unsplash.com/${UNSPLASH_MAP.default}?auto=format&fit=crop&w=400&q=80`;
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function parseProductText(text: string): Omit<Product, "id" | "image">[] {
  const results: Omit<Product, "id" | "image">[] = [];
  const segments = text.split(/,|\n/).map(s => s.trim()).filter(Boolean);

  for (const segment of segments) {
    const match =
      segment.match(/^(.+?)\s+(\d{1,3}(?:[,.]?\d{3})*(?:\.\d+)?)\s*(k|K)?\s*\/?-?\s*$/i) ||
      segment.match(/^(.+?)\s*[-–—]\s*(\d{1,3}(?:[,.]?\d{3})*(?:\.\d+)?)\s*(k|K)?\s*\/?-?\s*/i);

    if (match) {
      const rawName = match[1].replace(/[^\w\s']/g, "").trim();
      if (!rawName || rawName.length < 2) continue;
      const rawNum = match[2].replace(/,/g, "");
      let price = parseFloat(rawNum);
      if (match[3]) price *= 1000;
      if (price > 0 && price < 10_000_000) {
        results.push({ name: rawName, price: Math.round(price), currency: "KES" });
      }
    }
  }
  return results;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-KE").format(price);
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

// ─── Components ───────────────────────────────────────────────────────────────

function Header({ onRestore, hasStored }: { onRestore: () => void; hasStored: boolean }) {
  return (
    <header style={{ position: "relative", zIndex: 10, padding: "24px 16px 8px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}>
            <ShoppingBag size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: 0, lineHeight: 1 }}>SokoSnap</h1>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>Chat → Store → M‑Pesa in seconds</p>
          </div>
        </div>
        {hasStored && (
          <button onClick={onRestore} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, border: "1.5px solid var(--brand)", color: "var(--brand)", background: "var(--brand-light)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            <RotateCcw size={14} /> Restore catalog
          </button>
        )}
      </div>
    </header>
  );
}

function EmptyState({ onDemo }: { onDemo: () => void }) {
  const chips = [
    { icon: "👟", label: "Shoes 3500" }, { icon: "⌚", label: "Watch 5k" },
    { icon: "👜", label: "Bag 2200" }, { icon: "🧢", label: "Cap 800" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 16px", textAlign: "center" }}>
      <div className="animate-float" style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, var(--brand), var(--brand-dark))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 8px 32px rgba(16,185,129,0.35)" }}>
        <Zap size={32} color="white" />
      </div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, marginBottom: 8, lineHeight: 1.2, color: "var(--foreground)" }}>
        Turn any list into a <span style={{ color: "var(--brand)" }}>digital store</span>
      </h2>
      <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 280, marginBottom: 24, lineHeight: 1.6 }}>
        Paste your products below — prices like <code style={{ background: "var(--brand-light)", color: "var(--brand-dark)", padding: "1px 5px", borderRadius: 4 }}>2k</code> and <code style={{ background: "var(--brand-light)", color: "var(--brand-dark)", padding: "1px 5px", borderRadius: 4 }}>1500/-</code> work too.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {chips.map((chip, i) => (
          <div key={chip.label} className="animate-slide-up" style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13, fontWeight: 500, color: "var(--foreground)", animationDelay: `${i * 80}ms` }}>
            {chip.icon} {chip.label}
          </div>
        ))}
      </div>
      <button onClick={onDemo} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 14, background: "var(--amber)", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(245,158,11,0.4)", transition: "all 0.2s" }}>
        <Sparkles size={16} /> Try Demo Mode
      </button>
    </div>
  );
}

function ParsingOverlay() {
  const messages = ["Reading your product list…", "Extracting names & prices…", "Building your catalog…", "Almost ready!"];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div className="animate-spin-custom" style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid var(--brand-light)", borderTopColor: "var(--brand)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--brand)", opacity: 0.15, animation: "ping 1s ease-in-out infinite" }} />
      </div>
      <p key={msgIdx} className="animate-slide-up" style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>{messages[msgIdx]}</p>
      <p style={{ fontSize: 13, color: "var(--muted)" }}>AI is building your catalog…</p>
    </div>
  );
}

function ProductCard({ product, index, onBuy }: { product: Product; index: number; onBuy: (p: Product) => void }) {
  return (
    <div className="product-card animate-pop-in" style={{ background: "var(--card)", borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", animationDelay: `${index * 80}ms` }}>
      <div style={{ position: "relative", paddingBottom: "70%", overflow: "hidden" }}>
        <img src={product.image} alt={product.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 8, right: 8, background: "var(--brand)", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>KES</div>
      </div>
      <div style={{ padding: 12 }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--foreground)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</h3>
        <p style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)", marginBottom: 10 }}>
          {formatPrice(product.price)} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)" }}>KES</span>
        </p>
        <button onClick={() => onBuy(product)} style={{ width: "100%", padding: "9px 0", borderRadius: 12, background: "var(--brand)", color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s" }}>
          Buy via M‑Pesa
        </button>
      </div>
    </div>
  );
}

function ProductGrid({ products, onBuy }: { products: Product[]; onBuy: (p: Product) => void }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");

  let filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  if (sort === "asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div style={{ flex: 1, padding: "0 12px 12px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 0", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }}>
          <Search size={16} color="var(--muted)" />
          <input type="text" placeholder="Search products…" value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, border: "none", outline: "none", fontSize: 13, background: "transparent", color: "var(--foreground)" }} />
          {query && <button onClick={() => setQuery("")}><X size={13} color="var(--muted)" /></button>}
        </div>
        <div style={{ position: "relative" }}>
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} style={{ appearance: "none", padding: "10px 32px 10px 12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13, fontWeight: 600, color: "var(--foreground)", cursor: "pointer", outline: "none" }}>
            <option value="none">Sort</option>
            <option value="asc">Price ↑</option>
            <option value="desc">Price ↓</option>
          </select>
          <ChevronDown size={13} color="var(--muted)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {filtered.length > 0 ? filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} onBuy={onBuy} />
        )) : (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 16px", color: "var(--muted)" }}>
            <Package size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
            <p style={{ fontSize: 13 }}>No products match &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MpesaModal({ checkout, onClose, onChange, onPay }: {
  checkout: CheckoutState; onClose: () => void;
  onChange: (p: Partial<CheckoutState>) => void; onPay: () => void;
}) {
  const { product, qty, phone, phoneError, step } = checkout;
  if (!product) return null;
  const total = product.price * qty;

  return (
    <div className="mpesa-modal-bg" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }} onClick={e => e.target === e.currentTarget && step !== "processing" && onClose()}>
      <div className="animate-slide-up" style={{ width: "100%", maxWidth: 400, borderRadius: 28, overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.3)", background: "var(--card)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #00a651, #007a3d)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Smartphone size={18} color="white" />
            </div>
            <div>
              <p style={{ color: "white", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, margin: 0 }}>M‑Pesa Checkout</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>Lipa Na M‑Pesa</p>
            </div>
          </div>
          {step !== "processing" && (
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color="white" />
            </button>
          )}
        </div>

        <div style={{ padding: 20 }}>
          {step === "form" && (
            <>
              {/* Order Summary */}
              <div style={{ borderRadius: 16, padding: 12, marginBottom: 16, background: "var(--background)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>Order Summary</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={product.image} alt={product.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{product.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>KES {formatPrice(product.price)} × {qty}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => onChange({ qty: Math.max(1, qty - 1) })} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground)" }}>−</button>
                    <span style={{ width: 24, textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>{qty}</span>
                    <button onClick={() => onChange({ qty: qty + 1 })} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground)" }}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Total</p>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--brand)", margin: 0 }}>KES {formatPrice(total)}</p>
                </div>
              </div>

              {/* Phone Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", display: "block", marginBottom: 6 }}>M‑Pesa Phone Number</label>
                <input type="tel" placeholder="07XX XXX XXX" value={phone} maxLength={12} autoFocus
                  onChange={e => onChange({ phone: formatPhone(e.target.value), phoneError: "" })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${phoneError ? "#ef4444" : "var(--border)"}`, background: "var(--background)", fontSize: 14, color: "var(--foreground)", outline: "none", letterSpacing: "0.05em", boxSizing: "border-box" }}
                />
                {phoneError && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{phoneError}</p>}
              </div>

              <button onClick={onPay} style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "linear-gradient(135deg, #00a651, #007a3d)", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Syne, sans-serif" }}>
                <Smartphone size={18} /> Send STK Push — KES {formatPrice(total)}
              </button>
            </>
          )}

          {step === "processing" && (
            <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div className="pulse-ring-anim" style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Smartphone size={28} color="var(--brand)" />
              </div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--foreground)", margin: "0 0 6px" }}>STK Push Sent!</p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                Check your phone <strong style={{ color: "var(--foreground)" }}>{phone}</strong><br />Enter your M‑Pesa PIN to complete
              </p>
            </div>
          )}

          {step === "success" && (
            <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div className="animate-pop-in" style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <CheckCircle size={36} color="var(--brand)" />
              </div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--foreground)", margin: "0 0 4px" }}>Payment Confirmed!</p>
              <div style={{ width: "100%", borderRadius: 12, padding: 12, marginTop: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "left" }}>
                <p style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11, color: "#166534", marginBottom: 4 }}>M‑PESA CONFIRMATION</p>
                <p style={{ fontSize: 12, color: "#15803d", margin: "2px 0" }}>{String(Math.random()).slice(2, 12).toUpperCase()} Confirmed.</p>
                <p style={{ fontSize: 12, color: "#15803d", margin: "2px 0" }}>KES {formatPrice(total)} sent to {product.name} merchant.</p>
                <p style={{ fontSize: 12, color: "#15803d", margin: "2px 0" }}>New balance: KES {formatPrice(Math.floor(Math.random() * 5000) + 500)}</p>
              </div>
              <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: "12px 0", borderRadius: 14, background: "var(--brand)", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatBar({ value, onChange, onSend, onDemo, onImageUpload, disabled }: {
  value: string; onChange: (v: string) => void; onSend: () => void;
  onDemo: () => void; onImageUpload: (files: FileList) => void; disabled: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const canSend = value.trim() && !disabled;

  return (
    <div style={{ position: "sticky", bottom: 0, zIndex: 20, padding: "8px 12px 16px", background: "linear-gradient(to top, var(--background) 80%, transparent)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <button onClick={onDemo} disabled={disabled} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 999, border: "1.5px solid var(--amber)", background: "var(--card)", color: "var(--amber)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", opacity: disabled ? 0.5 : 1 }}>
            <Sparkles size={12} /> Demo Mode
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: 8, borderRadius: 22, border: "1.5px solid var(--border)", background: "var(--card)", boxShadow: "0 8px 32px -8px rgba(0,0,0,0.12)" }}>
          <button onClick={() => fileRef.current?.click()} disabled={disabled} aria-label="Upload images" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, border: "none", background: "var(--background)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", opacity: disabled ? 0.5 : 1 }}>
            <Camera size={20} color="var(--muted)" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && onImageUpload(e.target.files)} style={{ display: "none" }} />
          <textarea ref={textRef} value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKey} disabled={disabled} placeholder="Paste your product list… e.g., Shoes 2500, Bag 3k, Cap 500" rows={1} aria-label="Product list input"
            style={{ flex: 1, resize: "none", border: "none", outline: "none", fontSize: 14, lineHeight: 1.5, padding: "10px 0", background: "transparent", color: "var(--foreground)", maxHeight: 120, opacity: disabled ? 0.5 : 1 }}
          />
          <button onClick={onSend} disabled={!canSend} aria-label="Generate catalog" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, border: "none", background: canSend ? "var(--brand)" : "var(--border)", cursor: canSend ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", opacity: canSend ? 1 : 0.5 }}>
            <Send size={18} color={canSend ? "white" : "var(--muted)"} />
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
          Demo – M‑Pesa simulation only · Press Enter or ➡️ to generate
        </p>
      </div>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="toast" style={{ position: "fixed", bottom: 128, left: "50%", zIndex: 50, padding: "12px 18px", borderRadius: 14, background: "#1e293b", color: "white", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", whiteSpace: "nowrap", transform: "translateX(-50%)" }}>
      ⚠️ {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SokoSnapPage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [inputText, setInputText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [hasStored, setHasStored] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutState>({ product: null, qty: 1, phone: "", phoneError: "", step: "form" });

  useEffect(() => {
    try { if (localStorage.getItem("sokosnap_catalog")) setHasStored(true); } catch {}
  }, []);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleImageUpload = useCallback((files: FileList) => {
    setUploadedImages(Array.from(files).map(f => URL.createObjectURL(f)));
    showToast(`${files.length} image${files.length > 1 ? "s" : ""} uploaded!`);
  }, [showToast]);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) return;
    setAppState("parsing");
    await new Promise(r => setTimeout(r, 1600));
    const parsed = parseProductText(inputText);
    if (parsed.length === 0) {
      setAppState("idle");
      showToast("No products found. Try: 'Shirt 1200, Shoes 3500'");
      return;
    }
    const withImages: Product[] = parsed.map((p, i) => ({
      ...p, id: `prod_${Date.now()}_${i}`,
      image: uploadedImages[i] || getProductImage(p.name),
    }));
    setProducts(withImages);
    setAppState("catalog");
    try { localStorage.setItem("sokosnap_catalog", JSON.stringify(withImages)); setHasStored(true); } catch {}
  }, [inputText, uploadedImages, showToast]);

  const handleRestore = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem("sokosnap_catalog") || "");
      setProducts(data); setAppState("catalog");
    } catch { showToast("Could not restore catalog."); }
  }, [showToast]);

  const handleBuy = useCallback((product: Product) => {
    setCheckout({ product, qty: 1, phone: "", phoneError: "", step: "form" });
    setAppState("checkout");
  }, []);

  const handlePay = useCallback(() => {
    const digits = checkout.phone.replace(/\D/g, "");
    if (digits.length < 10 || !digits.startsWith("0")) {
      setCheckout(c => ({ ...c, phoneError: "Enter a valid Kenyan number (07XX XXX XXX)" }));
      return;
    }
    setCheckout(c => ({ ...c, step: "processing" }));
    setTimeout(() => setCheckout(c => ({ ...c, step: "success" })), 2200);
  }, [checkout.phone]);

  const handleCloseCheckout = useCallback(() => {
    setCheckout({ product: null, qty: 1, phone: "", phoneError: "", step: "form" });
    setAppState("catalog");
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header hasStored={hasStored} onRestore={handleRestore} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {appState === "idle" && <EmptyState onDemo={() => setInputText(DEMO_TEXT)} />}
        {appState === "parsing" && <ParsingOverlay />}
        {(appState === "catalog" || appState === "checkout") && <ProductGrid products={products} onBuy={handleBuy} />}
      </main>
      <ChatBar value={inputText} onChange={setInputText} onSend={handleGenerate} onDemo={() => setInputText(DEMO_TEXT)} onImageUpload={handleImageUpload} disabled={appState === "parsing"} />
      {appState === "checkout" && (
        <MpesaModal checkout={checkout} onClose={handleCloseCheckout} onChange={patch => setCheckout(c => ({ ...c, ...patch }))} onPay={handlePay} />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
