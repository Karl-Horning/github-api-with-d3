import "dotenv/config";
import { Octokit } from "@octokit/core";

/** @type {string} */
const API_KEY = process.env.API_KEY;

/** @type {string} */
const USERNAME = process.env.GITHUB_USERNAME || "Karl-Horning";

// Note: fetches only the first page of up to 100 repositories.
const REPO_API_ROUTE = "GET /users/{username}/repos?per_page=100&page=1";
const TOPIC_API_ROUTE = "GET /repos/{owner}/{repo}/topics";

// Topics excluded from the visualisation regardless of count.
const DEFAULT_TOPICS_TO_FILTER = ["freecodecamp", "codepen"];

if (!API_KEY || API_KEY.trim() === "") {
    console.error("Please provide a valid API_KEY variable in the .env file.");
    process.exit(1);
}

const octokit = new Octokit({ auth: API_KEY });

/**
 * Fetches repository information for a GitHub user.
 *
 * @param {string} [username] The GitHub username to fetch repositories for.
 *     Defaults to the value of `GITHUB_USERNAME` in `.env`.
 * @throws {Error} If the username is invalid or the API request fails.
 * @returns {Promise<Array<Object>>} Repository data from the GitHub API.
 */
const getAllRepoInformation = async (username = USERNAME) => {
    if (typeof username !== "string" || username.trim() === "") {
        throw new Error("Invalid username");
    }

    try {
        const response = await octokit.request(REPO_API_ROUTE, { username });

        console.log(`Successfully fetched repo information for ${username}`);

        return response.data;
    } catch (error) {
        console.error(`Error fetching repo information: ${error.message}`);

        throw new Error(
            `Error fetching repo information for ${username}: ${error.message}`
        );
    }
};

/**
 * Extracts repository names from an array of repository objects.
 *
 * @param {Array<Object>} repos Repository objects from the GitHub API.
 * @returns {Array<string>} Repository names.
 */
const getRepoNames = (repos) => repos.map((repo) => repo.name);

/**
 * Fetches topics for a single repository.
 *
 * @param {string} repo Repository name.
 * @throws {Error} If the API request fails.
 * @returns {Promise<Array<string>>} Topic names for the repository.
 */
const getRepoTopics = async (repo) => {
    try {
        const response = await octokit.request(TOPIC_API_ROUTE, {
            owner: USERNAME,
            repo,
        });

        console.log(`Successfully fetched ${repo}`);

        return response.data.names;
    } catch (error) {
        console.error(`Error fetching topic information: ${error.message}`);

        throw new Error(
            `Error fetching topics for repo ${repo}: ${error.message}`
        );
    }
};

/**
 * Fetches topics for multiple repositories in parallel.
 *
 * @param {Array<string>} repoNames Repository names to fetch topics for.
 * @returns {Promise<Array<Array<string>>>} Topic names grouped by repository.
 */
const getAllRepoTopics = async (repoNames) =>
    Promise.all(repoNames.map(getRepoTopics));

/**
 * Counts topic occurrences across all repositories and returns them sorted
 * by count descending, then alphabetically.
 *
 * @param {Array<string>} topics Flat array of topic names.
 * @returns {Array<{topic: string, count: number}>} Sorted topic counts.
 */
const createTopicObject = (topics) => {
    const topicCountObject = topics.reduce((acc, topic) => {
        const lowercaseTopic = topic.toLowerCase();
        acc[lowercaseTopic] = (acc[lowercaseTopic] || 0) + 1;
        return acc;
    }, {});

    const topicCountArray = Object.entries(topicCountObject).map(
        ([topic, count]) => ({ topic, count })
    );

    topicCountArray.sort(
        (a, b) => b.count - a.count || a.topic.localeCompare(b.topic)
    );

    return topicCountArray;
};

/**
 * Filters out low-signal topics from the topic count array.
 *
 * Topics with a count of 1 are excluded, as are any topics listed in
 * `topicsToFilter`.
 *
 * @param {Array<{topic: string, count: number}>} topics Topic count array.
 * @param {Array<string>} [topicsToFilter] Topics to exclude regardless of
 *     count. Defaults to {@link DEFAULT_TOPICS_TO_FILTER}.
 * @returns {Array<{topic: string, count: number}>} Filtered topic counts.
 */
const filterTopics = (topics, topicsToFilter = DEFAULT_TOPICS_TO_FILTER) =>
    topics.filter(
        (topic) => topic.count > 1 && !topicsToFilter.includes(topic.topic)
    );

/**
 * Fetches and aggregates GitHub repository topic statistics for the
 * configured user.
 *
 * @throws {Error} If any API request fails.
 * @returns {Promise<{username: string, topics: Array<{topic: string, count: number}>}>}
 *     The GitHub username and its filtered topic counts.
 */
const getReposTopicStats = async () => {
    try {
        const allRepos = await getAllRepoInformation();
        const repoNames = getRepoNames(allRepos);
        const allRepoTopics = await getAllRepoTopics(repoNames);
        const formattedRepoTopics = allRepoTopics.flatMap((topics) => topics);
        const topicObject = createTopicObject(formattedRepoTopics);
        const filteredTopics = filterTopics(topicObject);

        console.log(`There are ${filteredTopics.length} topics`);

        return { username: USERNAME, topics: filteredTopics };
    } catch (error) {
        console.error(`Error fetching topic stats: ${error.message}`);
        throw new Error(`Error fetching topic stats: ${error.message}`);
    }
};

export default getReposTopicStats;
