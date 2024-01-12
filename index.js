// Dev dependencies
const dotenv = require("dotenv");
const chalk = require("chalk");
// Dependencies
const { Octokit } = require("@octokit/core");

const { red, yellow, green } = chalk;

console.log(yellow("Hello, World!"));
dotenv.config();

/**
 * Ensure that the API_KEY variable is provided in the .env file
 */
if (!process.env.API_KEY) {
    console.error(red("Please provide a API_KEY variable in the .env file."));
    process.exit(1);
}

/**
 * The API key for GitHub
 * @type {number}
 */
const apiKey = process.env.API_KEY;

/**
 * Handle SIGINT for graceful shutdown.
 */
process.on("SIGINT", async () => {
    try {
        console.log(yellow("Received SIGINT. Closing Node.js app..."));
        await server.stop();
        console.log(green("Node.js app closed."));
        process.exit(0);
    } catch (error) {
        console.error(red("Error during graceful shutdown:"), error);
        process.exit(1);
    }
});

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
    auth: apiKey,
});

const getAllRepos = async () => {
    try {
        const response = await octokit.request("GET /users/{username}/repos", {
            username: "Karl-Horning",
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        return response;
    } catch (error) {
        return "Error:", error;
    }
};

const getRepoTags = async () => {
    try {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/topics",
            {
                owner: "Karl-Horning",
                repo: "change-string-case",
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );

        return response;
    } catch (error) {
        console.error("Error:", error);
    }
};

const logResponse = async () => {
    // const allRepos = await getAllRepos();
    const repoTags = await getRepoTags();

    console.log(repoTags.data.names);
};

logResponse();
