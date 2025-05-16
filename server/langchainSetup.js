import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { weatherTool } from "./tools/weatherTool.js";

dotenv.config();

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
  temperature: 0.4,
}).bindTools([weatherTool]);

export default model;


