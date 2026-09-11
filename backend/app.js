const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
dotenv.config();
const authRouter = require('./routes/authRouter')
const businessRouter = require("./routes/businessRouter");
const serviceRouter = require("./routes/serviceRouter");
const appointmentRouter = require("./routes/appointmentRouter")
const queueRouter = require("./routes/queueRouter")

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRouter)
app.use("/api/businesses", businessRouter)
app.use("/api/services", serviceRouter)
app.use("/api/appointments", appointmentRouter)
app.use("/api/queue", queueRouter)

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