import readline from 'readline';

const model = "nexusraven"; // nexusraven llama2-uncensored mistral llama-pro

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function ask() {
    await rl.question('Ask a question: ', async (input) => {
        if (input === 'bye') {
            console.log('Exiting...');
            rl.close();
        } else {
            const message = await chat(input);
            //console.log(message);
            
            const funcCall = message.substring(message.indexOf(":") + 2);
            console.log(funcCall);

            //const command = "controlHomeAssistant(entity_name='växtlampan', service='turn_off')";

            // Replace single quotes with double quotes and remove parentheses
            const jsonStr = funcCall.replace(/'/g, '"').replace('(', '{').replace(')', '}');
            
            // Extract function name and arguments
            const [funcName, argsStr] = jsonStr.split(/(?=\{)/);
            
            // Construct the JavaScript function call
            const jsCall = `${funcName}(${argsStr})`;
            
            console.log(funcName); // "controlHomeAssistant({"entity_name":"växtlampan", "service":"turn_off"})"
            console.log(argsStr);
            //const obj = JSON.parse(argsStr);
            //console.log(obj);
            // Use in eval (be careful with eval!)
            //eval(jsCall);


            //const result = JSON.parse(message);
            //console.log(result.tools[0].functionName);
            //console.log(result.tools[0].functionParams);

            await ask();
        }
    });
}

await ask();

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
        name: "getWeather",
        description: "Get the current weather for a given city name.",
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
    {
        name: "getCrypto",
        description: "Get the current price of a cryptocurrency.",
        parameters: {
            type: "object",
            properties: {
                symbol: {
                    type: "string",
                    description: "The symbol of the cryptocurrency, e.g. BTC, ETH or DOGE",
                },
            },
            required: ["symbol"],
        },
    },
    {
        name: "controlHomeAssistant",
        description: "Control a Home Assistant device with a given command. for example if i ask turn on <device_name>, turn off <device_name> or släck <device_name>, tänd <device_name>.",
        parameters: {
            type: "object",
            properties: {
                entity_name: {
                    type: "string",
                    description: "The name of the device/entity to control. Get from the User Query.",
                },
                service: {
                    type: "string",
                    enum: ["turn_on", "turn_off"],
                    description: "The service to call, e.g. if asked tänd then turn_on else if släck then turn_off",
                },
            },
            required: ["entity_name", "service"],
        },
    },
    ]
};


const nexusFormat = `
Function:
def getCrypto(symbol):
    """
    Fetches the current price of a cryptocurrency.

    Args:
    symbol (str): The symbol of the cryptocurrency, e.g. BTC, ETH or DOGE.

    Returns:
    str: The current price of the cryptocurrency.
    """

Function:
def controlHomeAssistant(entity_name, service):
    """
    Controls a Home Assistant device with a given command. for example if i ask turn on <device_name>, turn off <device_name> or släck <device_name>, tänd <device_name>.

    Args:
    entity_name (str): The name of the device/entity to control. Get from the User Query.4
    service (str): The service to call, e.g. if asked tänd then turn_on else if släck then turn_off

    Returns:
    boolean: True if the service was called successfully, False otherwise
    """

User Query: 
`;

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
        "functionName": "<name of the selected tool>",
        "functionParams": <parameters for the selected tool, matching the tool's JSON schema
   }}
}}
If there are multiple tools required, make sure a list of tools are returned in a JSON array.
If there is no tool that match the user request, you will respond with empty json.
Do not add any additional Notes or Explanations.

User Query:
`;

//console.debug(JSON.stringify(functions, null, 2));

export async function chat(input: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const userMessage = `${input}`;

        const payload = {
            "model": model,
            //"prompt": prompt + userMessage,
            "prompt": nexusFormat + userMessage, // + `<human_end>`,
            "options": {
                "temperature": 0.1,
                "stop": ["Thought:"]
            },
            //"format": "json",
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
            resolve(r.response.trim());
        } else {
            reject(new Error(`API request failed with status code: ${response.status}:`));
        }
    });
}

