import { Ollama } from "@langchain/community/llms/ollama";
import { ollamaUrl } from "./langchain_ollamaFunctions.js";

export async function ollamaAnswer(humanMessage:string, jsonObject:object): Promise<string> {
    const ollamaAnswer = new Ollama({
        baseUrl: ollamaUrl,
        model: "llama-pro",
    });
    const stream = await ollamaAnswer.stream(
        `Answer the question in the language in wich the question is asked in with only the answer for the question with the given json parameters without any explination or description. QUESTION:"${humanMessage}". JSON: "${JSON.stringify(jsonObject)}".`
    );
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return chunks.join("");
}