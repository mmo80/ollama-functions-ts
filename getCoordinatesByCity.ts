import { appId } from "./index.js";

export type Coordinates = {
    longitude: number;
    latitude: number;
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
