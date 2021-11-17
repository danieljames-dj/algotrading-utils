module.exports = async function (req, res) {
  const today = new Date();
  const day = today.getUTCDay();
  if (day === 0 || day === 6) {
    res.status(200).send(false);
  } else {
    res.status(200).send(true);
  }
};
