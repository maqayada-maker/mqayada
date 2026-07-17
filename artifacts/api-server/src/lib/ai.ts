import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

export const AI_ENABLED = Boolean(apiKey);

export const openai = apiKey ? new OpenAI({ apiKey }) : null;
