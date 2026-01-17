
import { GoogleGenAI, Type } from "@google/genai";
import { WebPageData } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchWebSimContent = async (query: string, adBlockEnabled: boolean = false): Promise<WebPageData> => {
  try {
    const adBlockInstruction = adBlockEnabled 
      ? "STRICT AD-BLOCKING ACTIVE: Do not include any advertisements, sponsored content, promotional banners, or tracking sidebars. Focus purely on the primary information. Provide a realistic count of how many 'ads' would have been there in the 'adBlockCount' field." 
      : "Include realistic web page elements like standard site ads or promotional sidebars to make it feel authentic.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Simulate the web page content for the URL or search query: "${query}". 
      ${adBlockInstruction}
      Return the response in a structured format suitable for rendering. 
      If it's a specific website (e.g. news, documentation), provide a realistic summary and layout structure. 
      Include a few realistic "internal links" that could exist on this site.
      Also provide a "favicon" URL if applicable (you can suggest a relevant emoji character or a placeholder URL).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING, description: "HTML-like content or a detailed markdown description of the page layout and data." },
            suggestedUrls: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "A list of related mock URLs or searches."
            },
            favicon: { type: Type.STRING, description: "A URL to a favicon or a simple emoji." },
            adBlockCount: { type: Type.INTEGER, description: "Number of ads filtered out if ad-blocking is active." }
          },
          required: ["title", "content", "suggestedUrls"]
        }
      }
    });

    // Extract text output from response.text property
    const data = JSON.parse(response.text || "{}");
    if (!data.favicon) {
      try {
        const url = new URL(query.startsWith('http') ? query : `https://${query}`);
        data.favicon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
      } catch {
        data.favicon = "🌐";
      }
    }
    return data;
  } catch (error) {
    console.error("Gemini failed to simulate page:", error);
    return {
      title: "Error 404",
      content: "<h1>Unable to connect</h1><p>The simulated web engine encountered an error. Please try again.</p>",
      suggestedUrls: ["nupur://newtab", "google.com"],
      favicon: "⚠️",
      adBlockCount: 0
    };
  }
};

export const analyzeImageForSearch = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      // Follow the correct method for generating content with multiple parts
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: "What is in this image? Provide a short, concise search query (max 5 words) that describes what is shown." },
        ],
      },
    });
    // Use response.text property directly
    return response.text || "search result";
  } catch (error) {
    console.error("Failed to analyze image:", error);
    return "visual search";
  }
};
