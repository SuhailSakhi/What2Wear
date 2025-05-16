import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import model from "./langchainSetup.js";
import { weatherTool } from "./tools/weatherTool.js";
import {
    HumanMessage,
    SystemMessage,
    ToolMessage,
} from "@langchain/core/messages";
import { Readable } from "stream";
import {
    saveClothingDocument,
    loadClothingEmbeddings,
} from "./embeddings.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let chatHistory = [];
let userFavorites = null;

app.post("/api/upload-favorites", async (req, res) => {
    const { favorites } = req.body;

    try {
        userFavorites = favorites;
        await saveClothingDocument(favorites);
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Fout bij upload:", err);
        res.status(500).json({ error: "Upload mislukt." });
    }
});

app.post("/api/ask", async (req, res) => {
    const { message } = req.body;
    console.log("Incoming message:", message);

    try {
        // Als er geen favorites in geheugen staan, laad ze uit de FAISS database
        let favoritesText;
        if (userFavorites) {
            favoritesText = JSON.stringify(userFavorites, null, 2);
        } else {
            const store = await loadClothingEmbeddings();
            if (store) {
                const results = await store.similaritySearch("user favorites", 1);
                favoritesText = results[0]?.pageContent || "(no favorites found)";
            } else {
                favoritesText = "(no favorites uploaded)";
            }
        }

        const systemPrompt = `
You are a weather-based clothing assistant.

The user has uploaded a list of their favorite clothing items. Use them to guide your advice. These are the items:

${favoritesText}

When the user asks a question like:
- "Can I wear shorts in Amsterdam?"
- "Moet ik een jas aan in Rotterdam?"

Your job:

1. Extract the city from the question.
2. Use the getWeather tool with that city.
3. Based on the temperature, conditions, and user's favorite items:
   - Say if it's a good idea or not.
   - Mention the temperature and condition briefly.
   - Prefer clothing from the user's favorites if possible.
4. Write your answer in the same language the user used (Dutch or English).
5. Keep it to 1 or 2 sentences max.
6. Do NOT suggest clothing that is not in the user's favorites.
`;

        if (chatHistory.length === 0) {
            chatHistory.push(new SystemMessage(systemPrompt));
        }

        chatHistory.push(new HumanMessage(message));

        const firstResponse = await model.invoke(chatHistory);

        if (firstResponse.tool_calls?.length > 0) {
            const toolCall = firstResponse.tool_calls[0];
            const args = toolCall.args;

            const toolResult = await weatherTool.func(args);
            chatHistory.push(firstResponse);
            chatHistory.push(
                new ToolMessage({
                    tool_call_id: toolCall.id,
                    content: toolResult,
                })
            );

            const finalStream = await model.stream(chatHistory);
            res.setHeader("Content-Type", "text/plain");
            const nodeStream = Readable.from(
                (async function* () {
                    for await (const chunk of finalStream) {
                        yield chunk.content || "";
                    }
                })()
            );
            return nodeStream.pipe(res);
        }

        const stream = await model.stream(chatHistory);
        res.setHeader("Content-Type", "text/plain");
        const nodeStream = Readable.from(
            (async function* () {
                for await (const chunk of stream) {
                    yield chunk.content || "";
                }
            })()
        );
        nodeStream.pipe(res);
    } catch (err) {
        console.error("Error during streaming:", err);
        res.status(500).end("Error occurred.");
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
