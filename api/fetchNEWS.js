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
      try {
        const parsedData = JSON.parse(data);
        console.log('API Response:', parsedData); // Log the entire response
        res.status(200).json(parsedData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Error parsing API response', details: error.message });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Error fetching news', details: error.message });
  });

  request.end();
};
