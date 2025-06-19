import express from "express";
import cors from "cors";
import { weatherHandler } from "./controllers/weatherController";

const app = express();

app.use(cors());
app.get("/weather", weatherHandler);

export default app;
