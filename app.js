import express from "express";

const app = express();
const port = 3000;

// Middleware
const myLogger = (req, res, next) => {
  console.log("Request received at:", new Date().toISOString());
  next();
};

app.use(myLogger);

// Route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});
