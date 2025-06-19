import axios from "axios";

export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export async function getWeather(latitude: number, longitude: number) {
  try {
    const response = await axios.get<WeatherData>(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&forecast_days=1&timezone=auto`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch weather data");
  }
}
