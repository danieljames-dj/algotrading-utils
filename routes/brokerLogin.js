module.exports = async function (req, res) {
  const [broker, user] = req.body.broker.split("_");
  switch (broker) {
    case "iifl":
      res.status(200).send();
      break;
    case "fyers":
      const fyers = require("../controllers/brokerLogin/fyers");
      try {
        await fyers(broker, user);
        res.status(200).send();
      } catch(err) {
	console.log(err);
        res.status(400).send({ error: "Broker login failed" });
      }
      break;
    default:
      res.status(400).send({ error: "Broker doesn't exist" });
  }
};
