const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "QueueLess API is running"
    });
});

// DB connection
const PORT = process.env.PORT || 5000;
const mongodbURL = process.env.MONGO_URI;
mongoose.connect(mongodbURL)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});