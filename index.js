require("dotenv").config();
const production = process.env.NODE_ENV === "production";
const connectFirebase = require("./config/connectFirebase");
const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/brokerLogin", require("./routes/brokerLogin"));
app.post("/discordLog", require("./routes/discordLog"));
app.post("/isMarketOpen", require("./routes/isMarketOpen"));

(async () => {
  try {
    await connectFirebase.connect(production);
    app.listen(port, () => {
      console.log(
        `Started listening to port ${port} in ${
          production ? "production" : "staging"
        } mode`
      );
    });
  } catch (e) {
    console.error("Firebase connection failed");
  }
})();
