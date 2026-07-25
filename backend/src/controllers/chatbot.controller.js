import { getChatbotReply } from "../utils/chatbotService.js";
import { chatMessageSchema } from "../validators/chatbot.validator.js";

export const sendMessage = async (req, res) => {
  try {
    const result = chatMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.errors });
    }

    const { message, history } = result.data;

    const reply = await getChatbotReply(message, history);

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong talking to the chatbot" });
  }
};
