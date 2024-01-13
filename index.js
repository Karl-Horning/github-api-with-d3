const express = require('express');
const path = require('path');
const getReposTopicStats = require('./src/libs');

const app = express();
const port = 3000;

// Serve static files (like your HTML and JS files)
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Define a route for fetching data from the API
app.get('/api/data', async (req, res) => {
  try {
    const githubData = await getReposTopicStats();
    res.json(githubData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route for the root path ("/") to render the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'html', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
