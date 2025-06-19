import axios from "axios";

interface GeoResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }>;
}

export async function getCoordinates(city: string) {
  try {
    const response = await axios.get<GeoResponse>(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    if (response.data.results && response.data.results.length > 0) {
      const loc = response.data.results[0];
      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        name: loc.name,
        country: loc.country
      };
    } else {
      throw new Error("City not found");
    }
  } catch (error) {
    throw new Error("Failed to fetch geocoding data");
  }
}
