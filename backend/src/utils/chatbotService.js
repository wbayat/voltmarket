import OpenAI from "openai";

// We used a free gpt-4o-mini model for the chatbot feature
// built lazily so a missing GITHUB_TOKEN only fails chatbot requests,
// instead of crashing the whole server at import time
let client;
const getClient = () => {
  if (!client) {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not configured");
    }
    client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN,
    });
  }
  return client;
};

const MODEL = "gpt-4o-mini";

// this is the system prompt that guides the model
// TODO: Update this later based how to navigate the website
const SYSTEM_PROMPT =
  "You are a helpful assistant for VoltMarket, an electric vehicle dealership website. " +
  "You help customers with questions about electric vehicles, financing, and using the site. " +
  "Keep answers concise and friendly. If you don't know something specific about VoltMarket's " +
  "actual inventory or policies, say so honestly instead of making it up.";

export const getChatbotReply = async (message, history = []) => {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history, // optional history
    { role: "user", content: message },
  ];

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};
