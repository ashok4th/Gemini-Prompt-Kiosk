import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type MediaPart = {
    data: string;
    mimeType: string;
};

export async function generateText(prompt: string, media: MediaPart | null): Promise<string> {
    try {
        let contents;

        if (media) {
            const mediaPart = {
                inlineData: {
                    mimeType: media.mimeType,
                    data: media.data,
                },
            };
            const parts: (typeof mediaPart | { text: string })[] = [mediaPart];
            if (prompt) {
                parts.push({ text: prompt });
            }
            contents = { parts };
        } else {
            contents = prompt;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error) {
            if (error.message.includes('400')) {
                return `Error: Bad request. Please check your input and try again. The media format might be unsupported or the content may have been blocked.`;
           }
            return `Error generating content: ${error.message}`;
        }
        throw new Error("Failed to generate content due to an unknown error.");
    }
}