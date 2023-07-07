const axios = require("axios");
const winston = require("winston");
const Bottleneck = require("bottleneck"); // Require the Bottleneck library

const arr = require("./data.json");

console.warn("Starting parser tester...");

// Interval in seconds
const n = 3;

// Create logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "logs/app.log" }),
        new winston.transports.Console()
    ]
});

// Create a new limiter with a maximum number of 20 concurrent requests
const limiter = new Bottleneck({
    maxConcurrent: 10
});

// Function to make a POST request
const makeRequest = async () => {
    // Choose a random element from the array
    const text = arr[Math.floor(Math.random() * arr.length)];

    try {
        const response = await axios.post("http://parser:3000/parse", {
            text
        });
        logger.info("Risposta OK:", JSON.stringify(response.data));
    } catch (err) {
        logger.error("Errore:", err);
    }
};

// Wrap the makeRequest function with the limiter
const limitedMakeRequest = limiter.wrap(makeRequest);

// Repeat the request every n seconds
setInterval(limitedMakeRequest, n * 1000);
