"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinates = getCoordinates;
const axios_1 = __importDefault(require("axios"));
async function getCoordinates(city) {
    try {
        const response = await axios_1.default.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (response.data.results && response.data.results.length > 0) {
            const loc = response.data.results[0];
            return {
                latitude: loc.latitude,
                longitude: loc.longitude,
                name: loc.name,
                country: loc.country
            };
        }
        else {
            throw new Error("City not found");
        }
    }
    catch (error) {
        throw new Error("Failed to fetch geocoding data");
    }
}
