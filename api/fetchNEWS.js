const https = require('https');

module.exports = (req, res) => {
  const { topic } = req.query;
  const newsApiKey = process.env.NEWS_API_KEY;

  const options = {
    hostname: 'newsapi.org',
    path: `/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${newsApiKey}&language=en&pageSize=5`,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      res.status(200).json(JSON.parse(data));
    });
  });

  request.on('error', (error) => {
    res.status(500).json({ error: 'Error fetching news' });
  });

  request.end();
};
