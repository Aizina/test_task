"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = getWeather;
const axios_1 = __importDefault(require("axios"));
async function getWeather(latitude, longitude) {
    try {
        const response = await axios_1.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&forecast_days=1&timezone=auto`);
        return response.data;
    }
    catch (error) {
        throw new Error("Failed to fetch weather data");
    }
}
