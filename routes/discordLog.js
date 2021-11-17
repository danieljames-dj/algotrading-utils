const fetch = require("node-fetch");

module.exports = async function (req, res) {
  const message = req.body.message;
  const webhookKey = req.body.webhookKey;
  const baseURL = "https://discord.com/api/webhooks/";
  try {
    await fetch(baseURL + webhookKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
    res.status(200).send();
  } catch (error) {
    console.log("error", error);
    res.status(400).send({
      error: "Discord sending failed",
    });
  }
};
