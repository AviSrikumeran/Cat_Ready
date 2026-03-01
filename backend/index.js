const app = require("./app");
const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cat Ready API listening on http://0.0.0.0:${PORT}`);
});
