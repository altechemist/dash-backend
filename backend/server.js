const express = require("express");
const cors = require("cors");
const dbRoutes = require("./routes/routes");

const port = 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use("/api", dbRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
