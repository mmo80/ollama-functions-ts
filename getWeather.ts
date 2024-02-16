import { appId } from "./langchain_ollamaFunctions.js";

export type WeatherResponse = {
    cityName: string;
    temperature: number;
    tempUnit: string;
    weatherDescription: string;
    language: string;
}

export type WeatherRequest = {
    cityName: string;
    unit: string;
    language: string;
}

export type Coordinates = {
    longitude: number;
    latitude: number;
}

export async function getWeather(request: WeatherRequest): Promise<WeatherResponse> {
    return new Promise(async (resolve, reject) => {
        const coords = await getCoordinatesByCity(request.cityName);

        const queryParams = new URLSearchParams({
            "lat": coords.latitude.toString(),
            "lon": coords.longitude.toString(),
            "units": request.unit,
            "lang": request.language,
            "appid": appId || "",
        });
        const url = `https://api.openweathermap.org/data/2.5/weather?${queryParams.toString()}`;

        const response = await fetch(url);
        if (response.status === 200) {
            const data = await response.json();
            if (data.length === 0) {
                reject(new Error("City not found"));
            }
            const weather: WeatherResponse = {
                cityName: request.cityName,
                tempUnit: request.unit === "metric" ? "°C" : "°F",
                weatherDescription: data.weather[0].description,
                temperature: data.main.temp,
                language: request.language,
            };

            resolve(weather);
        } else {
            reject(new Error(`API request failed with status code: ${response.status}:`));
        }
    });
}

export async function getCoordinatesByCity(cityName: string): Promise<Coordinates> {
    return new Promise(async (resolve, reject) => {
        const queryParams = new URLSearchParams({
            "q": cityName,
            "limit": "1",
            "appid": appId || ""
        });
        const url = `https://api.openweathermap.org/geo/1.0/direct?${queryParams.toString()}`;

        const response = await fetch(url);
        if (response.status === 200) {
            const data = await response.json();
            if (data.length === 0) {
                reject(new Error("City not found"));
            }
            const coords: Coordinates = {
                longitude: data[0].lon,
                latitude: data[0].lat
            };
    
            resolve(coords);
        } else {
            reject(new Error(`API request failed with status code: ${response.status}:`));
        }
    });
}

export function weatherString(language: string): string {
    switch (language) {
        case "se":
            return "Vädret i {cityName} är nu {temperature}{tempUnit} och {weatherDescription}.";
        case "en":
            return "The weather in {cityName} is currently {temperature}{tempUnit} and {weatherDescription}.";
        case "es":
            return "El clima en {cityName} es actualmente {temperature}{tempUnit} y {weatherDescription}.";
        default:
            return "The weather in {cityName} is currently {temperature}{tempUnit} and {weatherDescription}.";
    }
}