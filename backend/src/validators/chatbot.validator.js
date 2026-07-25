import { z } from "zod";

// each history entry is a prior turn in the conversation, sent by the
// frontend so the chatbot has context across multiple messages
const historyEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000),
  history: z.array(historyEntrySchema).max(20).optional().default([]),
});
