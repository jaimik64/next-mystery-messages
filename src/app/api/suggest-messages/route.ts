import { openai } from "@ai-sdk/openai";
import { streamText, StreamData, generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const response = await gemini();

  return NextResponse.json(response, { status: 200 });
}

async function gemini() {
  try {
    const prompt =
      "Create a list of three open-ended and enagaging questions formatted as a single string. Each question should be seperated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity and contribute to a positive and welcoming conversational environment";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);

    return result;
  } catch (err) {
    console.error("Error while executing gemini: " + JSON.stringify(err));
    throw new Error("Error while executing gemini");
  }
}

async function openAi(req: Request, openaiClient: OpenAI) {
  try {
    const prompt =
      "Create a list of three open-ended and enagaging questions formatted as a single string. Each question should be seperated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity and contribute to a positive and welcoming conversational environment";

    const data = new StreamData();
    data.append({ test: "value" });

    const result = await streamText({
      model: openai("gpt-4"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      onFinish() {
        data.close();
      },
    });

    return result.toDataStreamResponse({ data });
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      const { name, status, headers, message } = err;

      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      console.error("Error while processing text: " + err);
      throw err;
    }
  }
}
