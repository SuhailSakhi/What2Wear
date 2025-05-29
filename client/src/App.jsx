import { useState } from "react";
import "./index.css";

function App() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favUploaded, setFavUploaded] = useState(false);
    const [showInfo, setShowInfo] = useState(false);


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
        if (!input.trim() || loading) return; // voorkomen van lege invoer of dubbele verzoeken

        if (!favUploaded && messages.length === 0) {
            const proceed = window.confirm(
                "Je hebt nog geen kledingbestand geüpload. Doorgaan met laatst opgeslagen favorieten?"
            );
            if (!proceed) return;
        }

//
        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);// tijdens het wachten op antwoord


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
                const words = chunk.split(/(\s+)/);

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
            setLoading(false); // zodra antwoord klaar is
        }
    };

    return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-100 flex items-center justify-center px-4 py-8">
                <div
                    className="w-full max-w-3xl bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/40 flex flex-col space-y-6">
                    {/* Info button in the top-right corner */}
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => setShowInfo(true)}
                            className="text-sky-700 text-xl bg-white/70 rounded-full px-3 py-1 shadow hover:bg-white transition"
                            aria-label="Toon uitleg"
                        >
                            ℹ️
                        </button>
                    </div>

                    {/* Info Modal */}
                    {showInfo && (
                        <div
                            className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-start justify-end z-50 p-6">
                            <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Over deze app</h2>
                                    <button
                                        onClick={() => setShowInfo(false)}
                                        className="text-gray-500 hover:text-gray-800 text-xl"
                                        aria-label="Sluit"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                    What2Wear is een AI-app die kledingadvies geeft op basis van het weer zodat je niet
                                    ziek wordt.
                                    Upload eerst een JSON-bestand met je favoriete kledingstukken.
                                </p>
                                <p className="text-sm text-gray-700">
                                    Stel daarna een vraag, zoals: <i>“wat zal ik dragen in Amsterdam?”</i>
                                    De AI zal reageren met advies, alleen gebaseerd op jouw eigen kleding.
                                </p>
                            </div>
                        </div>
                    )}

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
                            disabled={loading}//
                            className="flex-grow px-5 py-4 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg shadow-sm transition disabled:opacity-50"
                        />
                        <button
                            onClick={handleAsk}
                            disabled={loading}//
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




