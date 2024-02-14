import { Ollama } from "@langchain/community/llms/ollama";
import dotenv from 'dotenv';

dotenv.config();
const ollamaUrl = process.env.OLLAMA_URL;

const ollamaAnswer = new Ollama({
    baseUrl: ollamaUrl,
    model: "llama-pro", //"mistral",// "llama-pro",
});

let humanMessage = "Vad är det för väder i Göteborg?";
let params = "{cityName: 'Göteborg', tempUnit: '°C', weatherDescription: 'klar himmel', temperature: 6.22, language: 'se'}";

// let humanMessage = "Whats the current weather like in New York?";
// let params = "{cityName: 'New York', tempUnit: '°F', weatherDescription: 'clear skies', temperature: 27.22, language: 'en'}";

// let humanMessage = "Que clima es en buenos aires ahora?";
// let params = "{cityName: 'Buenos Aires', tempUnit: '°C', weatherDescription: 'cielo claro', temperature: 25.0, language: 'es'}";

const stream = await ollamaAnswer.stream(
    `Answer the question in the language in wich the question is asked and give only the answer 
    for the question with the given json parameters without any explination or description. 
    QUESTION:"${humanMessage}". JSON: "${params}".`
);
//  and without quotation marks
// Only answer the question no explination or description is needed.
// Answer for example: "The weather in {cityName} is currently {temperature}{tempUnit} and {weatherDescription}".
const chunks = [];
for await (const chunk of stream) {
    chunks.push(chunk);
}

console.log(chunks.join(""));