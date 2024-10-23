
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;
const db = require('./config/database');

// Middleware
app.use(bodyParser.json());

// Routes
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/applications', applicationRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
