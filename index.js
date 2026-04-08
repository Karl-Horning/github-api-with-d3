/**
 * @fileoverview Express server that exposes GitHub topic statistics via a
 * REST endpoint and serves the D3 visualisation frontend.
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import getReposTopicStats from "./src/libs/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "src", "public")));

/** Returns aggregated GitHub topic statistics as JSON. */
app.get("/api/data", async (_req, res) => {
    try {
        const githubData = await getReposTopicStats();
        res.json(githubData);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/** Serves the D3 visualisation page. */
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "src", "public", "html", "index.html"));
});

app.use((err, _req, res, _next) => {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

process.on("SIGINT", () => {
    try {
        console.log("Received SIGINT. Closing Node.js app...");
        server.close(() => {
            console.log("Server closed. Exiting process.");
            process.exit(0);
        });
    } catch (error) {
        console.error("Error during graceful shutdown:", error);
        process.exit(1);
    }
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
