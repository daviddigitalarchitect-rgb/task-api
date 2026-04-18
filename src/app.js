const express = require('express');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

module.exports = app;