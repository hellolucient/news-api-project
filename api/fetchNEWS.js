module.exports = (req, res) => {
  const { topic } = req.query;
  res.status(200).json({
    message: "API is working",
    receivedTopic: topic
  });
};
