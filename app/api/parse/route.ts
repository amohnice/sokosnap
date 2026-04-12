import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback to basic regex if no API key
      return NextResponse.json(fallbackRegexParse(text));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Extract a list of products from the following text. 
      For each product, identify its name and price (as a number).
      If the price is mentioned with 'k', multiply by 1000.
      If currency isn't specified, assume KES.
      Return the result ONLY as a JSON array of objects with keys: "name", "price".
      
      Text: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();
    
    // Clean up markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?|```/g, "").trim();
    
    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function fallbackRegexParse(text: string) {
  const results: { name: string; price: number }[] = [];
  const segments = text.split(/,|\n/).map(s => s.trim()).filter(Boolean);

  for (const segment of segments) {
    const match =
      segment.match(/^(.+?)\s+(\d{1,3}(?:[,.]?\d{3})*(?:\.\d+)?)\s*(k|K)?\s*\/?-?\s*$/i) ||
      segment.match(/^(.+?)\s*[-–—]\s*(\d{1,3}(?:[,.]?\d{3})*(?:\.\d+)?)\s*(k|K)?\s*\/?-?\s*/i);

    if (match) {
      const name = match[1].trim();
      const rawNum = match[2].replace(/,/g, "");
      let price = parseFloat(rawNum);
      if (match[3]) price *= 1000;
      results.push({ name, price: Math.round(price) });
    }
  }
  return results;
}
