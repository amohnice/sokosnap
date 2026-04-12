You are building a production-ready, single-file Next.js 14+ (App Router) page called `page.tsx` for **SokoSnap**.

**Product Vision:**  
A chat‑to‑catalog tool for micro‑sellers. The merchant types or pastes a messy list of products (e.g., *"Red dress 2500, belt 800, watch 5k"*) into a **chat‑style input bar**, optionally adds product images, and the app instantly generates a beautiful, searchable product grid with a **simulated M‑Pesa STK Push** checkout.

---

## Tech Stack (strict)
- Next.js App Router (`use client`)
- Tailwind CSS
- Framer Motion (or CSS transitions)
- Lucide React icons
- Optional: `@google/generative-ai`

---

## Core Functional Requirements

### 1. Chat‑Style Input (Not branded as WhatsApp)
- **Layout:** A sticky bottom bar (like a chat interface) containing:
    - A **textarea** with placeholder: *“Paste your product list… e.g., Shoes 2500, Bag 3k, Cap 500”*
    - A **📷 Camera/Upload icon** – allows uploading product images (matched in order to parsed products)
    - A **send / generate icon** (➡️ or ✨)
- **Above the chat bar** is the product grid area (empty until parsing).

### 2. Demo Mode Button
- Located near the chat bar (or as a floating button).
- Auto‑fills the textarea with:  
  `"Men's sneakers 3500, Leather belt 1200, Smartwatch 5k, Cap 800 – all in stock"`

### 3. Parsing Logic (AI‑first with regex fallback)
- **Step A (Gemini, if API key provided):**  
  Send text to Gemini 1.5 Flash with prompt:  
  *“Extract product name and price in KES. Return JSON: [{name, price, currency:'KES'}]. Prices like '2k', '1500/-', '3500'. Ignore non-product text.”*
- **Step B (fallback regex):**  
  Pattern: `(.*?)\s+(\d+(?:\.\d+)?)\s*(k|K|/-)?` → convert `2k` → 2000.
- **Loading state:** Show spinner with *“AI is building your catalog…”* (minimum 1.5s).

### 4. Product Image Mapping
- If user uploaded images → assign in order (first image → first product).
- Else → generate relevant Unsplash image based on product name keywords (e.g., “shoe” → shoe image).
- Fallback: `https://images.unsplash.com/photo-1542291026-7eec264c27ff`

### 5. Product Grid & Search
- Responsive grid (2 columns mobile, 4 desktop).
- Each `ProductCard`: image, name, price (KES), **“Buy”** button.
- **Real‑time search bar** (filters by name).
- **Sort dropdown:** price low‑high / high‑low.

### 6. M‑Pesa Checkout Modal
- Click “Buy” → modal opens.
- **Order summary:** product name, quantity (editable), total.
- **Phone number input** (Kenyan format: 07XX XXX XXX).
- **Simulated STK Push:**  
  After “Pay” → spinner + *“STK Push sent…”* → 2 sec later → success with checkmark and M‑Pesa‑style confirmation message.
- Close modal on success.

### 7. State Management
States: `'idle' | 'parsing' | 'catalog' | 'checkout'`

### 8. Persistence (optional)
- Save catalog to `localStorage` on generation.
- On reload, show **“Restore last catalog”** button if data exists.

### 9. Error Handling
- Zero products parsed → toast: *“No products found. Try: 'Shirt 1200, Shoes 3500'”*
- Invalid phone number → inline error.

---

## UI/UX Details
- **Primary color:** Emerald‑500 (call it “brand green”).
- **Background:** Slate‑50.
- **Cards:** White, rounded‑xl, shadow‑md.
- **Chat bar:** Rounded‑full, border, subtle shadow, positioned at bottom on mobile (or fixed bottom).
- **Typography:** Inter / system font.
- **Animations:** Product cards pop in with scale+fade when catalog appears.
- **Header:** “SokoSnap” + tagline: *“Chat → Store → M‑Pesa in seconds”*
- **Footer disclaimer:** *“Demo – M‑Pesa simulation only”*

---

## Constraints
- **Single file:** `app/page.tsx` (no extra API routes unless necessary).
- **Fully responsive** (mobile‑first).
- **No backend** – all in memory / localStorage.
- **Accessible:** ARIA labels, focus rings.

---

## Example Flow (for testing)
1. Click **Demo Mode** → textarea fills.
2. Click **Generate** → loading, then 4 products appear.
3. Search “belt” → only belt shows.
4. Click **Buy** on sneakers → enter `0712345678` → success.
5. Reload page → **“Restore last catalog”** works.

---

## Final Instruction
Generate the complete `page.tsx` with all sub‑components inside. Use `'use client'`. Include all imports. Make it copy‑paste ready for a Next.js project. No external dependencies beyond Tailwind, Framer Motion (optional), and Lucide React.
