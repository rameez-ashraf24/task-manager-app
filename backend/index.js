const cors = require('cors');
const express = require('express');
const dns = require ('node:dns'); // or const dns = require('node:dns');
const mongoose = require('mongoose'); // Mongoose ko import kiya
require('dotenv').config();

const app = express();
dns.setServers(['8.8.8.8', '1.1.1.1']);
// Middleware

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Server aur Database dono set hain!");
});

// Routes Middleware
app.use('/api/auth', require('./routes/auth'));

app.use('/api/tasks', require('./routes/tasks'));

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Database Connected successfully! ✅'))
    .catch((err) => {
        console.error('Database Connection Error: ❌');
        console.error(err);
    });

// Basic Route
app.get('/', (req, res) => {
    res.send('Server aur Database dono set hain!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});