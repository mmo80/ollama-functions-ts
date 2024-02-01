import { getCoordinatesByCity } from "./getCoordinatesByCity.js";
import { appId } from "./index.js";

export type WeatherResponse = {
    temperature: number;
    weatherDescription: string;
}

export type WeatherRequest = {
    cityName: string;
    unit: string;
    language: string
}
export async function getWeather(request: WeatherRequest): Promise<WeatherResponse> {
//export async function getWeather(cityName: string, unit: string, language: string): Promise<WeatherResponse> {
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
                weatherDescription: data.weather[0].description,
                temperature: data.main.temp
            };

            resolve(weather);
        } else {
            reject(new Error(`API request failed with status code: ${response.status}:`));
        }
    });
}
