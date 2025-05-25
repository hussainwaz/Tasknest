import { useState, useEffect } from "react";

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetch("/Quotes.json")  // assuming your JSON is in public/quotes.json
      .then((res) => res.json())
      .then((quotes) => {
        const seed = new Date().toISOString().slice(0, 10);
        const index = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotes.length;
        setQuote(quotes[index]);
      })
      .catch(() => {
        setQuote({ text: "Failed to load quote.", author: "" });
      });
  }, []);

  if (!quote) return <div></div>;

  return (
    <div className="px-4 py-2 mb-4 border-l-4 border-orange-900 bg-[#13293dff] rounded">
      <p className="text-md italic text-[#fffbfeff]">"{quote.text}"</p>
      <p className="text-sm text-gray-400 text-right mt-1">— {quote.author}</p>
    </div>
  );
}
