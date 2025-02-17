const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const i18next = require('./config/i18n');
const errorHandler = require('./middleware/error.middleware');
const responseEnhancer = require('./utils/response.helper');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(responseEnhancer);

// i18next middleware
app.use((req, res, next) => {
    req.i18n = i18next;
    next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Error handling
app.use(errorHandler); 