// server.ts
import express from "express";
import fetch from "node-fetch";
import Redis from "ioredis";

const app = express();
const PORT = process.env.PORT || 4000;
const redis = new Redis();

const CACHE_TTL_SECONDS = 15 * 60; // 15 минут

// Получение координат города
async function getCoordinates(city: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }
  const loc = data.results[0];
  return {
    latitude: loc.latitude,
    longitude: loc.longitude,
    name: loc.name,
    country: loc.country,
  };
}

// Получение прогноза погоды
async function getWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

app.get("/weather", async (req, res) => {
  try {
    const city = req.query.city as string;
    if (!city) return res.status(400).json({ error: "City query param required" });

    // Ключ кеша
    const cacheKey = `weather:${city.toLowerCase()}`;
    // Проверяем кеш
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Получаем координаты
    const coords = await getCoordinates(city);
    // Получаем погоду
    const weatherData = await getWeather(coords.latitude, coords.longitude);

    // Формируем ответ
    const response = {
      city: `${coords.name}, ${coords.country}`,
      latitude: coords.latitude,
      longitude: coords.longitude,
      hourly: weatherData.hourly?.time?.map((time: string, i: number) => ({
        time,
        temperature: weatherData.hourly.temperature_2m[i],
      })) ?? [],
    };

    // Сохраняем в кеш
    await redis.set(cacheKey, JSON.stringify(response), "EX", CACHE_TTL_SECONDS);

    res.json(response);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to fetch weather" });
  }
});

app.listen(PORT, () => {
  console.log(`Weather API server running on http://localhost:${PORT}`);
});
