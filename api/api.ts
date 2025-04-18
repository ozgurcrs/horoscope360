import { Tarot } from "@/constants/tarots";
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta";

const geminiApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

geminiApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url && !config.url.includes("key=")) {
      config.url = `${config.url}${config.url.includes("?") ? "&" : "?"}key=${GEMINI_API_KEY}`;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Giden istek:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("İstek hatası:", error);
    return Promise.reject(error);
  }
);

geminiApi.interceptors.response.use(
  (response: AxiosResponse) => {
    // Yanıtı logla (geliştirme sırasında)
    if (process.env.NODE_ENV === "development") {
      console.log("Gelen yanıt:", {
        status: response.status,
        headers: response.headers,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    console.error(
      "Yanıt hatası:",
      error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : error.message
    );

    return Promise.reject(error);
  }
);

export const generateGeminiContent = async (prompt: string) => {
  try {
    const response = await geminiApi.post(
      "/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    return response.data;
  } catch (error) {
    console.error("Gemini API hatası:", error);
    throw error;
  }
};

export const generateTarotCard = async (prompt: string, tarots: Tarot[]) => {
  const response = await geminiApi.post(
    "/models/gemini-2.0-flash:generateContent",
    {
      contents: [{ parts: [{ text: prompt }] }],
    }
  );

  const aiText = response.data.candidates[0].content.parts[0].text;

  console.log(aiText);

  return aiText;
};

export default geminiApi;
