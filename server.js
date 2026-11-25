
const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

connectDB();


app.get("/", (req, res) => {
  res.status(200).json({
        message: "Sticky Notes API is running"
    });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
