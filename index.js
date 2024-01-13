const express = require("express");
const path = require("path");
const getReposTopicStats = require("./src/libs");

const chalk = require("chalk");
const { red, yellow, green, bgWhite } = chalk;

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (like HTML and JS files)
app.use(express.static(path.join(__dirname, "src", "public")));

// Define a route for fetching data from the API
app.get("/api/data", async (req, res) => {
    try {
        // Fetch GitHub data and send it as JSON
        const githubData = await getReposTopicStats();
        res.json(githubData);
    } catch (error) {
        // Handle errors during data fetching
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Define a route for the root path ("/") to render the HTML file
app.get("/", (req, res) => {
    // Serve the main HTML file
    res.sendFile(path.join(__dirname, "src", "public", "html", "index.html"));
});

// Generic error handling middleware
app.use((err, req, res, next) => {
    // Handle unexpected errors
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// Handle SIGINT for graceful shutdown.
process.on("SIGINT", () => {
    try {
        // Notify about SIGINT and initiate graceful shutdown
        console.log(yellow("Received SIGINT. Closing Node.js app..."));
        // Close the server
        server.close(() => {
            console.log(green("Server closed. Exiting process."));
            process.exit(0);
        });
    } catch (error) {
        // Handle errors during graceful shutdown
        console.error(red("Error during graceful shutdown:"), error);
        process.exit(1);
    }
});

// Start the server
const server = app.listen(port, () => {
    // Server started successfully
    console.log(bgWhite(`Server is running on http://localhost:${port} 🚀`));
});
