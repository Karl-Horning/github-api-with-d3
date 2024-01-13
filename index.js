// Dev dependencies
const dotenv = require("dotenv");
const chalk = require("chalk");

// Dependencies
const { Octokit } = require("@octokit/core");

// Destructuring to get specific chalk colours
const { red, yellow, green } = chalk;

// Load environment variables from .env file
dotenv.config();

// Ensure that the API_KEY variable is provided in the .env file
if (!process.env.API_KEY) {
    console.error(red("Please provide a API_KEY variable in the .env file."));
    process.exit(1);
}

/**
 * The API key for GitHub
 * @type {number}
 */
const API_KEY = process.env.API_KEY;
const USERNAME = "Karl-Horning";
const REPO_API_ROUTE = "GET /users/{username}/repos?per_page=100&page=1";
const TAG_API_ROUTE = "GET /repos/{owner}/{repo}/topics";

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

// Ensure that the API_KEY variable is provided in the .env file
if (!API_KEY || API_KEY.trim() === "") {
    console.error(
        red("Please provide a valid API_KEY variable in the .env file.")
    );
    process.exit(1);
}

/**
 * The API key for GitHub
 * @type {number}
 */
const apiKey = API_KEY;

const octokit = new Octokit({
    auth: apiKey,
});

/**
 * Fetches repository information for a GitHub user.
 *
 * @param {string} [username=USERNAME] - The GitHub username for which to fetch repository information.
 * @throws {Error} Throws an error if the provided username is invalid or if there's an issue fetching the repository information.
 * @returns {Promise<Array>} A promise that resolves to an array containing repository information for the specified user.
 */
const getAllRepoInformation = async (username = USERNAME) => {
    // Input validation
    if (typeof username !== "string" || username.trim() === "") {
        throw new Error("Invalid username");
    }

    try {
        // API request to fetch repo information
        const response = await octokit.request(REPO_API_ROUTE, {
            username,
        });

        // Log the successful response
        console.log(
            green(`Successfully fetched repo information for ${username}`)
        );

        return response.data;
    } catch (error) {
        // Log the error
        console.error(red(`Error fetching repo information: ${error.message}`));

        // Rethrow the error with a more descriptive message
        throw new Error(
            `Error fetching repo information for ${username}: ${error.message}`
        );
    }
};

/**
 * Extracts repo names from an array of repositories.
 *
 * @param {Array} repos - An array of repository objects.
 * @returns {Array} An array of repository names.
 */
const getRepoNames = (repos) => repos.map((repo) => repo.name);

/**
 * Fetches topics for a specific repository.
 *
 * @param {string} repo - The name of the repository.
 * @throws {Error} Throws an error if there's an issue fetching topic information.
 * @returns {Promise<Array>} A promise that resolves to an array containing topic names for the specified repository.
 */
const getRepoTopics = async (repo) => {
    try {
        const response = await octokit.request(TAG_API_ROUTE, {
            owner: USERNAME,
            repo,
        });

        // Log the successful response
        console.log(green(`Successfully fetched ${repo}`));

        return response.data.names;
    } catch (error) {
        // Log the error
        console.error(red(`Error fetching topic information: ${error.message}`));

        // Rethrow the error with a more descriptive message
        throw new Error(
            `Error fetching topics for repo ${repo}: ${error.message}`
        );
    }
};

/**
 * Fetches topics for multiple repositories in parallel.
 *
 * @param {Array} repoNames - An array of repository names.
 * @returns {Promise<Array>} A promise that resolves to an array containing topic names for multiple repositories.
 */
const getAllRepoTopics = async (repoNames) =>
    Promise.all(repoNames.map(getRepoTopics));

/**
 * Creates an array of objects representing topic counts based on the input array of topics.
 *
 * @param {string[]} formattedRepoTopics - An array containing topic names.
 * @returns {Object[]} An array of objects with topic names as keys and their corresponding counts as values.
 */
const createTopicObject = (formattedRepoTopics) => {
    // Create an object to count topic occurrences
    const topicCountObject = formattedRepoTopics.reduce((acc, topic) => {
        const lowercaseTopic = topic.toLowerCase();
        acc[lowercaseTopic] = (acc[lowercaseTopic] || 0) + 1;
        return acc;
    }, {});

    // Convert the object to an array of objects
    const topicCountArray = Object.entries(topicCountObject).map(
        ([topic, count]) => ({
            topic,
            count,
        })
    );

    // Sort the array by count in descending order
    topicCountArray.sort(
        (a, b) => b.count - a.count || a.topic.localeCompare(b.topic)
    );

    return topicCountArray;
};

/**
 * Filters out specified topics and topics with count less than or equal to 1.
 *
 * @param {Object[]} topics - An array of objects with topic names and their corresponding counts.
 * @param {string[]} topicsToFilter - An array of topic names to filter out.
 * @returns {Object[]} An array of filtered objects with topic names and counts.
 */
const filterTopics = (topics, topicsToFilter = ["freecodecamp", "codepen"]) => {
    return topics.filter(
        (topic) => topic.count > 1 && !topicsToFilter.includes(topic.topic)
    );
};

/**
 * Logs the response containing formatted repository topics.
 */
const logResponse = async () => {
    try {
        const allRepos = await getAllRepoInformation();
        const repoNames = getRepoNames(allRepos);
        const allRepoTopics = await getAllRepoTopics(repoNames);
        const formattedRepoTopics = allRepoTopics.flatMap((topics) => topics);
        const topicObject = createTopicObject(formattedRepoTopics);
        const filteredTopics = filterTopics(topicObject);
        console.log(`There are ${green(filteredTopics.length)} topics:`);
        console.log(filteredTopics);
    } catch (error) {
        console.error(red(`Error in logResponse: ${error.message}`));
    }
};

logResponse();
