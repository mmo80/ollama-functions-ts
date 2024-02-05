import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
import { WeatherRequest, getWeather, weatherString } from "./getWeather.js";
import { fillTemplate } from "./formatString.js";

dotenv.config();
export const appId = process.env.APPID;
export const ollamaUrl = process.env.OLLAMA_URL;

const startTime = Date.now();

const ollamaFunctions = new OllamaFunctions({
    temperature: 0.1,
    model: "mistral",//"mistral", //"llama-pro",
    baseUrl: ollamaUrl
}).bind({
    functions: [{
            name: "getWeather",
            description: "Get the current weather for a given city name.", // Base the language by the user query and the temperature unit by the city country location.
            parameters: {
                type: "object",
                properties: {
                    cityName: {
                        type: "string",
                        description: "The city name, e.g. San Francisco, Göteborg or Stockholm",
                    },
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

let unit = "metric";
let languageOutput = "se";
let humanMessage = "Vad är det för väder i Göteborg?";
//let humanMessage = "Whats the current weather like in New York?";
//let humanMessage = "Que clima es en buenos aires ahora?";

const response = await ollamaFunctions.invoke([
    new HumanMessage({
        content: humanMessage,
    }),
]);

console.log(`Q: ${humanMessage}`);

let functionName:string = response.additional_kwargs.function_call?.name ?? "";
let jsonStringArgs:string = response.additional_kwargs.function_call?.arguments ?? "";
//console.log(functionName);
//console.log(jsonStringArgs);

var params = JSON.parse(jsonStringArgs);
//console.log(params);

switch (functionName) {
    case 'getWeather':
        let p:WeatherRequest = {
            cityName: params.cityName,
            unit: unit,
            language: languageOutput
        };
        //console.log(p);
        const r = await getWeather(p);
        //console.log(r);

        let msg = fillTemplate(weatherString(r.language), r);
        console.log(`A: ${msg}`);
        break;
    default:
        console.error('Function does not exist');
}

const endTime = Date.now();
const elapsedTime = (endTime - startTime) / 1000;
console.log(`Elapsed time: ${elapsedTime} seconds`);





