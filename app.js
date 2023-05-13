const express = require('express');
const app = express();
const IBservice = require('./src/router/ib-server');

// Middleware to parse the request body
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Define a route for the homepage
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.use(IBservice);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
