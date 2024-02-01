import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
import { getWeather, WeatherResponse } from "./getWeather.js";

dotenv.config();
export const appId = process.env.APPID;

const startTime = Date.now();

const model = new OllamaFunctions({
    temperature: 0.1,
    model: "mistral",
    baseUrl: "http://localhost:11434"
}).bind({
    functions: [
        {
            name: "getWeather",
            description: "Get the current weather for a given city name",
            parameters: {
                type: "object",
                properties: {
                    cityName: {
                        type: "string",
                        description: "The city name, e.g. San Francisco, Göteborg or Stockholm",
                    },
                    unit: { type: "string", enum: ["metric", "imperial"] },
                    language: { type: "string", enum: ["se", "en"] },
                },
                required: ["cityName"],
            },
        },
    ],
    // You can set the `function_call` arg to force the model to use a function
    function_call: {
        name: "getWeather",
    },
});

const response = await model.invoke([
    new HumanMessage({
        content: "Vad är det för väder i Göteborg?",
    }),
]);

let functionName:any = response.additional_kwargs.function_call?.name ?? "";
let jsonStringArgs = response.additional_kwargs.function_call?.arguments ?? "";
console.log(functionName);
//console.log(jsonStringArgs);

var params = JSON.parse(jsonStringArgs);
console.log(params);


console.log('------ RESULT ------');

switch (functionName) {
    case 'getWeather':
        const data = await getWeather(params);
        console.log(data);
        break;
    default:
        console.error('Function does not exist');
}

// test getWeather
//let functionNamee = 'getWeather';
//let paramss = { cityName: 'Stockholm', unit: 'metric', language: 'se' };
//const data = await getWeather(params);
//console.log(data);

const endTime = Date.now();
const elapsedTime = (endTime - startTime) / 1000;
console.log(`Elapsed time: ${elapsedTime} seconds`);





