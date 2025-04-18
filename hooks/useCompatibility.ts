import { useState } from "react";
import geminiApi from "@/api/api";
import { compatibilityPrompt } from "@/constants/prompts";

type Values = {
  name: string;
  nameToCompare: string;
  yourBirthDate: Date | null;
  theirBirthDate: Date | null;
};

export const useCompatibility = () => {
  const [values, setValues] = useState<Values>({
    name: "",
    nameToCompare: "",
    yourBirthDate: null,
    theirBirthDate: null,
  });

  const handleCompareCompatibility = async () => {
    const response = await geminiApi.post(
      "/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: compatibilityPrompt(
                  values.name,
                  values.nameToCompare,
                  values.yourBirthDate?.toISOString() || "",
                  values.theirBirthDate?.toISOString() || ""
                ),
              },
            ],
          },
        ],
      }
    );

    const aiText = response.data.candidates[0].content.parts[0].text;
    console.log(aiText);

    return aiText;
  };

  const handleChangeName = (
    key: keyof Values,
    value: string | Date | undefined
  ) => {
    setValues({ ...values, [key]: value });
  };

  return { values, handleChangeName, handleCompareCompatibility };
};
