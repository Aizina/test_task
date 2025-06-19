"use client";

import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


interface HourlyDataPoint {
  time: string;
  temperature: number;
}

interface WeatherApiResponse {
  city: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const WeatherInfo: React.FC = () => {
  const [city, setCity] = useState("Moscow");
  const [weatherData, setWeatherData] = useState<HourlyDataPoint[] | null>(null);
  const [resolvedCity, setResolvedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);
    setResolvedCity(null);

    try {
      const response = await axios.get<WeatherApiResponse>(
        `${API_URL}/weather?city=${encodeURIComponent(city)}`
      );
      
      const { time, temperature_2m } = response.data.hourly;
      const hourlyData = time.map((t, i) => ({
        time: new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        temperature: temperature_2m[i],
      }));
      
      setWeatherData(hourlyData);
      setResolvedCity(response.data.city);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response) {
        setError(e.response.data.message || "Failed to fetch weather data.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [city]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        fetchWeather();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
          Прогноз погоды
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Введите название города..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow px-4 py-2 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700"
          />
          <button
            onClick={fetchWeather}
            disabled={loading || !city.trim()}
            className="px-6 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? "Загрузка..." : "Получить"}
          </button>
        </div>

        <div className="mt-6 min-h-[350px] flex items-center justify-center">
          {loading && <p>Идет загрузка данных...</p>}
          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          {weatherData && resolvedCity && (
            <div className="w-full space-y-4">
              <h2 className="text-2xl font-semibold text-center">
                Почасовой прогноз в <span className="text-blue-600 dark:text-blue-400">{resolvedCity}</span>
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="time" tick={{ fill: 'currentColor' }} />
                  <YAxis
                    unit="°C"
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tick={{ fill: 'currentColor' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)", // dark:bg-slate-800
                      borderColor: "#334155",
                      color: "#f1f5f9"
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                    formatter={(value: number) => [`${value}°C`, "Температура"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#3b82f6" // blue-500
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
