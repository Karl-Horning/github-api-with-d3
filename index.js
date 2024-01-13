const getReposTopicStats = require("./src/libs");

const chalk = require("chalk");

// Destructuring to get specific chalk colours
const { red, yellow, green } = chalk;

// Handle SIGINT for graceful shutdown.
process.on("SIGINT", async () => {
    try {
        console.log(yellow("Received SIGINT. Closing Node.js app..."));
        console.log(green("Node.js app closed."));
        process.exit(0);
    } catch (error) {
        console.error(red("Error during graceful shutdown:"), error);
        process.exit(1);
    }
});

getReposTopicStats();
