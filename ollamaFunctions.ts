// import { Ollama } from 'ollama'
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Ask a question: ', async (input) => {
    const message = await chat(input);
    console.log(message);
    const result = JSON.parse(message);
    console.log(result.tools[0].tool);
    console.log(result.tools[0].tool_input);
    rl.close();
});

const functions = {
    type: "function",
    functions: [{
        name: "getCapital",
        description: "Get the capital of a given country.",
        parameters: {
            type: "object",
            properties: {
                country: {
                    type: "string",
                    description: "The country name, e.g. Sweden, France or Germany",
                },
            },
            required: ["country"],
        }
    },
    {
        name: "getGeneral",
        description: "Get general information about a topic that is not related to any other function.",
        parameters: {
            type: "object",
            properties: {
                question: {
                    type: "string",
                    description: "The prompt to generate a response for",
                },
            },
            required: ["prompt"],
        },
    },
    ]
};

// {
//     name: "getGeneral",
//     description: "Get general information about a topic that is not related to any other function.",
//     parameters: {
//         type: "object",
//         properties: {
//             question: {
//                 type: "string",
//                 description: "The prompt to generate a response for",
//             },
//         },
//         required: ["prompt"],
//     },
// },
// {
//     name: "getCrypto",
//     description: "Get the current price of a cryptocurrency.",
//     parameters: {
//         type: "object",
//         properties: {
//             symbol: {
//                 type: "string",
//                 description: "The symbol of the cryptocurrency, e.g. BTC, ETH or DOGE",
//             },
//         },
//         required: ["symbol"],
//     },
// },


// const schema = {
//     capital: {
//         type: "string",
//         description: "The capital of the country, e.g. Stockholm, Madrid or Berlin.",
//     }
// };

const prompt = `
You have access to the following tools:
${JSON.stringify(functions)}

You must follow these instructions:
Always select one or more of the above tools based on the user query
If a tool is found, you must respond in the JSON format matching the following schema:
{{
   "tools": {{
        "tool": "<name of the selected tool>",
        "tool_input": <parameters for the selected tool, matching the tool's JSON schema
   }}
}}
If there are multiple tools required, make sure a list of tools are returned in a JSON array.
If there is no tool that match the user request, you will respond with empty json.
Do not add any additional Notes or Explanations

User Query:
`;

//console.debug(JSON.stringify(functions, null, 2));

export async function chat(input: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const userMessage = `${input}`;

        const payload = {
            "model": "llama2-uncensored", //"mistral:latest",
            "prompt": prompt + userMessage,
            "options": {
                "temperature": 0.0,
            },
            "format": "json",
            "stream": false,
        };

        const url = `http://localhost:11434/api/generate`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.status === 200) {
            const r = await response.json();
            resolve(r.response);
        } else {
            reject(new Error(`API request failed with status code: ${response.status}:`));
        }
    });
}



// let functions: [{
//     name: "getWeather",
//     description: "Get the current weather for a given city name.",
//     parameters: {
//         type: "object",
//         properties: {
//             cityName: {
//                 type: "string",
//                 description: "The city name, e.g. San Francisco, Göteborg or Stockholm",
//             },
//         },
//         required: ["cityName"],
//     },
// },
//     {
//         name: "getGeneral",
//         description: "Get general information about a topic that is not related to any other function or if the status of devices is asked.",
//         parameters: {
//             type: "object",
//             properties: {
//                 prompt: {
//                     type: "string",
//                     description: "The prompt to generate a response for",
//                 },
//             },
//             required: ["prompt"],
//         },
//     },
//     {
//         name: "getCrypto",
//         description: "Get the current price of a cryptocurrency.",
//         parameters: {
//             type: "object",
//             properties: {
//                 symbol: {
//                     type: "string",
//                     description: "The symbol of the cryptocurrency, e.g. BTC, ETH or DOGE",
//                 },
//             },
//             required: ["symbol"],
//         },
//     },
//     {
//         name: "controlHomeAssistant",
//         description: "Control a Home Assistant device with a given command. if asked about status of devices use getGeneral instead.",
//         parameters: {
//             type: "object",
//             properties: {
//                 domain: {
//                     type: "string",
//                     enum: ["input_boolean", "light", "switch"],
//                     description: "The domain of the entity to control, e.g. light, switch, input_boolean or media_player",
//                 },
//                 service: {
//                     type: "string",
//                     enum: ["toggle", "turn_on", "turn_off"],
//                     description: "The service to call, e.g. turn_on, turn_off, toggle or media_play_pause",
//                 },
//                 entity_id: {
//                     type: "string",
//                     description: "The entity_id from the SYSTEM csv-table to use, e.g. light.living_room, switch.bedroom or media_player.kitchen.",
//                 },
//             },
//             required: ["domain", "service", "entity_id"],
//         },
//     },
// ];
// // You can set the `function_call` arg to force the model to use a function
// function_call: {
//     name: "getWeather",
// },
