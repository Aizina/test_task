import { Request, Response } from "express";
import { getCoordinates } from "../services/geocodingService";
import { getWeather, WeatherData } from "../services/weatherService";
import * as memoryCache from "../cache/memoryCache";

const CACHE_TTL = 900; 

interface CachedWeather {
  city: string;
  latitude: number;
  longitude: number;
  hourly: WeatherData['hourly'];
}

export async function weatherHandler(req: Request, res: Response) {
  const city = req.query.city as string;

  if (!city) {
    return res.status(400).json({ message: "City parameter is required" });
  }

  const cacheKey = `weather:${city.toLowerCase()}`;

  try {
    const cached = memoryCache.get<CachedWeather>(cacheKey);
    if (cached) {
      console.log(`[Cache] HIT for ${city}`);
      return res.json(cached);
    }
    
    console.log(`[Cache] MISS for ${city}`);

    const location = await getCoordinates(city);

    const weatherData = await getWeather(location.latitude, location.longitude);

    const result: CachedWeather = {
      city: `${location.name}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude,
      hourly: weatherData.hourly
    };

    memoryCache.set(cacheKey, result, CACHE_TTL);
    console.log(`[Cache] SET for ${city} with TTL ${CACHE_TTL}s`);

    return res.json(result);

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error(`[Error] Failed to process weather request for ${city}:`, error.message);

        if (error.message.includes("City not found")) {
            return res.status(404).json({ message: `City '${city}' not found.` });
        }

        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
    
    return res.status(500).json({ message: "An unknown error occurred" });
  }
}
