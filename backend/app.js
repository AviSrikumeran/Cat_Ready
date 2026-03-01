require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const inspectionsRouter = require("./routes/inspections");

initDb();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use("/api", inspectionsRouter);

module.exports = app;
