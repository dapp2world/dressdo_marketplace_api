const fs = require("fs");
const path = require("path");

const models = {};

// Dynamically read all files in the models directory except index.js
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    models[model.modelName] = model; // Store model by name
  });

module.exports = models;
