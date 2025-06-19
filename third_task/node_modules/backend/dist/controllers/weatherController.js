"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherHandler = weatherHandler;
const geocodingService_1 = require("../services/geocodingService");
const weatherService_1 = require("../services/weatherService");
const memoryCache = __importStar(require("../cache/memoryCache"));
const CACHE_TTL = 900;
async function weatherHandler(req, res) {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
    }
    const cacheKey = `weather:${city.toLowerCase()}`;
    try {
        const cached = memoryCache.get(cacheKey);
        if (cached) {
            console.log(`[Cache] HIT for ${city}`);
            return res.json(cached);
        }
        console.log(`[Cache] MISS for ${city}`);
        const location = await (0, geocodingService_1.getCoordinates)(city);
        const weatherData = await (0, weatherService_1.getWeather)(location.latitude, location.longitude);
        const result = {
            city: `${location.name}, ${location.country}`,
            latitude: location.latitude,
            longitude: location.longitude,
            hourly: weatherData.hourly
        };
        memoryCache.set(cacheKey, result, CACHE_TTL);
        console.log(`[Cache] SET for ${city} with TTL ${CACHE_TTL}s`);
        return res.json(result);
    }
    catch (error) {
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
