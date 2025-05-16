import { useState } from "react";
import "./index.css";

function App() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favUploaded, setFavUploaded] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        try {
            const json = JSON.parse(text);
            const res = await fetch("http://localhost:3001/api/upload-favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favorites: json }),
            });
            if (res.ok) {
                setFavUploaded(true);
            } else alert("Upload mislukt");
        } catch (err) {
            alert("Ongeldig JSON-bestand");
        }
    };

    const handleAsk = async () => {
        if (!input.trim() || loading) return;

        if (!favUploaded && messages.length === 0) {
            const proceed = window.confirm(
                "Je hebt nog geen kledingbestand geüpload. Doorgaan met laatst opgeslagen favorieten?"
            );
            if (!proceed) return;
        }


        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let aiMessage = { role: "assistant", content: "" };
            setMessages((prev) => [...prev, aiMessage]);

            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
                const words = chunk.split(/(\s+)/); // woorden en spaties

                for (let word of words) {
                    aiMessage.content += word;
                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { ...aiMessage };
                        return updated;
                    });
                    await new Promise((r) => setTimeout(r, 60));
                }
            }
        } catch (err) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Er ging iets mis." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-3xl bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/40 flex flex-col space-y-6">
                <h1 className="text-4xl font-bold text-center text-gray-800">What 2 Wear</h1>

                <input
                    type="file"
                    accept="application/json"
                    onChange={handleUpload}
                    className="text-sm"
                />

                <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl w-fit max-w-[80%] ${
                                msg.role === "user"
                                    ? "bg-sky-100 self-end ml-auto"
                                    : "bg-white border border-sky-200 self-start"
                            }`}
                        >
                            <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="e.g. Can I wear shorts in Amsterdam?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        className="flex-grow px-5 py-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg shadow-sm transition disabled:opacity-50"
                    />
                    <button
                        onClick={handleAsk}
                        disabled={loading}
                        className="px-6 py-4 rounded-xl bg-sky-500 text-white text-lg font-semibold hover:bg-sky-600 transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Ask AI"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
