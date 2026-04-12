
# 🛒 SokoSnap – Chat‑to‑Cart Engine

**Turn any messy chat message into a beautiful digital catalog with M‑Pesa checkout — in seconds.**

SokoSnap is a lightweight, AI‑powered web app for Kenyan micro‑merchants. Paste a messy list of products (e.g., *"Shoes 2500, belt 800, watch 5k"*) into a chat‑style input, and instantly get a professional, searchable product grid with a simulated **M‑Pesa STK Push** checkout.

---

## ✨ Features

- 📝 **Chat‑style input** – Type or paste product lists naturally (supports `2k`, `1500/-`, `3500` formats)
- 🖼️ **Optional image upload** – Match your own photos to products
- 🤖 **AI‑powered parsing** – Gemini API (optional) with regex fallback
- 🛍️ **Instant product grid** – Clean, responsive, with high‑quality Unsplash placeholders
- 🔍 **Real‑time search & sort** – Filter by name, sort by price
- 💳 **M‑Pesa checkout simulation** – Realistic STK Push modal with phone entry and success confirmation
- 💾 **Local storage persistence** – Restore your last catalog after page reload
- 📱 **Mobile‑first design** – Works flawlessly on any device

---

## 🚀 Demo Mode

Click **"✨ Demo Mode"** to auto‑fill the chat with:

```
Men's sneakers 3500, Leather belt 1200, Smartwatch 5k, Cap 800 – all in stock
```

Then click **"Generate Catalog"** → a full store appears in ~1.5 seconds.

---

## 🧱 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14+ (App Router)            |
| UI Library  | React 18 (client components)        |
| Styling     | Tailwind CSS                        |
| Animations  | Framer Motion (or CSS transitions)  |
| Icons       | Lucide React                        |
| AI (opt.)   | Google Gemini 1.5 Flash API         |
| Persistence | LocalStorage                        |

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sokosnap.git
cd sokosnap

# 2. Install dependencies
npm install
# or
yarn install

# 3. (Optional) Add Gemini API key
# Create a .env.local file:
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🧪 How It Works

1. **User types/pastes** product text into the chat bar (or uses Demo Mode).
2. **Optional:** Upload product images (matched in order).
3. **Click Generate** → app parses text using regex (or Gemini if key provided).
4. **Loading animation** → product cards appear with relevant images.
5. **Search/sort** to refine the catalog.
6. **Click "Buy"** on any product → M‑Pesa modal opens.
7. **Enter phone number** → simulated STK Push → success confirmation.

---

## 🔧 Configuration

### Using Gemini AI (Optional but recommended)

To enable better parsing of messy text (e.g., *"2k for shoes, belt 12 hundred"*):

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=AIza...
   ```
3. The app will automatically use Gemini; if no key is present, it falls back to regex.

### Customising the product image fallback

Edit the `getProductImage(productName)` function inside `page.tsx` to map keywords to your own Unsplash URLs.

---

## 🧠 Parsing Examples

| User input                      | Parsed result                          |
|---------------------------------|----------------------------------------|
| `Shoes 2500`                    | `{ name: "Shoes", price: 2500 }`       |
| `Belt 1.2k`                     | `{ name: "Belt", price: 1200 }`        |
| `Watch 5k, cap 800/-`           | Two products: 5000 and 800             |
| `Dress – 3,500 with free bag`   | `{ name: "Dress", price: 3500 }` (ignores extra text) |

---

## 📁 Project Structure (single‑file prototype)

```
sokosnap/
├── app/
│   └── page.tsx          # Entire application in one file
├── public/               # (optional) static assets
├── .env.local            # API keys
├── package.json
└── README.md
```

> *Note:* This is a **single‑file prototype** for quick demos. For production, split components into separate files.

---

## 🛡️ Disclaimer

> This app includes a **simulated M‑Pesa STK Push** for demonstration purposes only. No real transactions are processed. Always integrate with an official payment gateway (e.g., Safaricom Daraja API) for production use.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request for:

- Better regex/AI parsing
- Real Daraja API integration
- Multi‑product cart support
- Order history

---

## 📄 License

MIT — free for personal and commercial use.

---

## 🙌 Acknowledgements

- Unsplash for placeholder images
- Google Gemini API for AI parsing
- The Kenyan informal sector for inspiration

---

**Built with ❤️ for Kenya’s micro‑merchants.**
