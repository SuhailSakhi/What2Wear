import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import fs from "fs";

const DB_PATH = "./clothing_embeddings.index";

export const saveClothingDocument = async (jsonData) => {
    const text = JSON.stringify(jsonData, null, 2);
    const docs = [new Document({ pageContent: text })];
    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
    await vectorStore.save(DB_PATH);

    console.log("✅ Embeddings opgeslagen in FAISS op:", DB_PATH);
};

export const loadClothingEmbeddings = async () => {
    const embeddings = new OpenAIEmbeddings();

    if (!fs.existsSync(DB_PATH)) {
        console.warn("⚠️ Geen embeddings gevonden. Upload eerst favorieten.");
        return null;
    }

    const vectorStore = await FaissStore.load(DB_PATH, embeddings);
    return vectorStore;
};
