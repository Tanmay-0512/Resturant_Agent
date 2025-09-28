import express from "express";
import dotenv from "dotenv";
import path from "path";

import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";

dotenv.config();
const port = 3000;
const app = express();
app.use(express.json());

const __dirname = path.resolve();

// Initialize Google Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "models/gemini-2.5-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Broad classification menu tool
const menus = {
  breakfast: {
    drinks: ["Tea", "Coffee", "Orange Juice"],
    starters: ["Idli", "Poha", "Fruit Salad"],
    main: {
      Indian: ["Aloo Paratha", "Masala Dosa"],
      Continental: ["Pancakes", "Omelette"],
    },
    diet: {
      vegan: ["Poha", "Fruit Salad"],
      vegetarian: ["Aloo Paratha", "Masala Dosa"],
    },
  },
  lunch: {
    appetizers: ["Paneer Tikka", "Veg Spring Roll"],
    main: {
      Indian: ["Dal Tadka", "Paneer Butter Masala", "Jeera Rice"],
      Italian: ["Veg Pizza", "Pasta Primavera"],
    },
    desserts: ["Gulab Jamun", "Ice Cream"],
    diet: {
      vegan: ["Dal Tadka", "Veg Spring Roll"],
      vegetarian: ["Paneer Butter Masala", "Veg Pizza"],
    },
  },
  dinner: {
    main: {
      Indian: ["Butter Chicken", "Paneer Butter Masala", "Veg Pulao"],
      Italian: ["Pasta Alfredo", "Margherita Pizza"],
    },
    desserts: ["Brownie", "Gulab Jamun"],
    beverages: ["Lassi", "Soft Drinks"],
  },
  snacks: {
    starters: ["French Fries", "Samosa", "Nachos"],
    beverages: ["Tea", "Coffee", "Cold Drinks"],
  },
};

export const getMenuTool = new DynamicStructuredTool({
  name: "getMenuTool",
  description:
    "Return the final answer for today's menu based on category, subcategory, cuisine, or diet. Filters are optional.",
  schema: z.object({
    category: z
      .string()
      .describe("Type of meal (breakfast, lunch, dinner, snacks)"),
    subcategory: z
      .string()
      .optional()
      .describe("Optional: e.g., main, desserts, beverages, starters"),
    cuisine: z
      .string()
      .optional()
      .describe("Optional: e.g., Indian, Italian, Chinese"),
    diet: z
      .string()
      .optional()
      .describe("Optional: vegan, vegetarian, gluten-free"),
  }),
  func: async ({ category, subcategory, cuisine, diet }) => {
    category = category.toLowerCase();
    if (!menus[category]) {
      return `No menu found for "${category}". Available categories: ${Object.keys(
        menus
      ).join(", ")}`;
    }

    let result = menus[category];

    // If no subcategory/cuisine/diet, flatten all items under this category
    if (!subcategory && !cuisine && !diet) {
      const flattened = [];
      for (const key in result) {
        if (Array.isArray(result[key])) flattened.push(...result[key]);
        else if (typeof result[key] === "object") {
          for (const innerKey in result[key]) {
            flattened.push(...result[key][innerKey]);
          }
        }
      }
      return `Here are all ${category} items:\n- ${flattened.join("\n- ")}`;
    }

    // Apply subcategory filter
    if (subcategory) {
      subcategory = subcategory.toLowerCase();
      if (!result[subcategory]) {
        return `No ${subcategory} found in ${category}. Available: ${Object.keys(
          result
        ).join(", ")}`;
      }
      result = result[subcategory];
    }

    // Apply cuisine filter
    if (cuisine && typeof result === "object" && !Array.isArray(result)) {
      cuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
      if (!result[cuisine]) {
        return `No ${cuisine} options found in ${category}${
          subcategory ? " -> " + subcategory : ""
        }`;
      }
      result = result[cuisine];
    }

    // Apply diet filter
    if (diet && typeof result === "object" && !Array.isArray(result)) {
      diet = diet.toLowerCase();
      if (!result[diet]) {
        return `No ${diet} options found in ${category}${
          subcategory ? " -> " + subcategory : ""
        }`;
      }
      result = result[diet];
    }

    // Final result: array -> convert to string
    if (Array.isArray(result)) {
      return `Here are the items for ${category}${
        subcategory ? " -> " + subcategory : ""
      }${cuisine ? " (" + cuisine + ")" : ""}${
        diet ? " [" + diet + "]" : ""
      }:\n- ${result.join("\n- ")}`;
    }

    return "No items found for your query.";
  },
});

// Setup Chat Prompt
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant that uses tools when needed"],
  ["human", "{input}"],
  ["ai", "{agent_scratchpad}"],
]);

// Create Tool Calling Agent
const agent = await createToolCallingAgent({
  llm: model,
  tools: [getMenuTool],
  prompt,
});

const executor = await AgentExecutor.fromAgentAndTools({
  agent,
  tools: [getMenuTool],
  verbose: true,
  maxIterations: 1,
  returnIntermediateSteps: true,
});

// Serve webpage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Chat API
app.post("/api/chat", async (req, res) => {
  const userInput = req.body.input;
  console.log("UserInput: ", userInput);

  const allowedKeywords = [
    "menu",
    "food",
    "breakfast",
    "lunch",
    "dinner",
    "dish",
    "order",
    "restaurant",
  ];

  const isRelated = allowedKeywords.some((word) =>
    userInput.toLowerCase().includes(word)
  );

  if (!isRelated) {
    return res.json({
      output:
        "I can only help with restaurant-related questions like menu, food, or orders 🍽️",
    });
  }

  try {
    const response = await executor.invoke({ input: userInput });
    console.log("Agent full response: ", response);
    const data = response.intermediateSteps?.[0]?.observation;

    if (
      response.output &&
      response.output !== "Agent stopped due to max iterations."
    ) {
      return res.json({ output: response.output });
    } else if (data != null) {
      return res.json({ output: data });
    }

    res.status(500).json({ output: "Agent couldn't find a valid answer." });
  } catch (err) {
    console.log("Error during agent execution:", err);
    res
      .status(500)
      .json({ output: "Sorry, something went wrong. Please try again later." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
