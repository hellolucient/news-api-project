const https = require('https');

module.exports = (req, res) => {
  const { topic } = req.query;
  const newsApiKey = process.env.NEWS_API_KEY;

  console.log('Received topic:', topic);
  console.log('API Key:', newsApiKey ? 'Present' : 'Missing');

  const options = {
    hostname: 'newsapi.org',
    path: `/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${newsApiKey}&language=en&pageSize=5`,
    method: 'GET',
    headers: {
      'User-Agent': 'NewsAPIClient/1.0'
    }
  };

  console.log('Request URL:', `https://${options.hostname}${options.path}`);

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('Raw API Response:', data);
      try {
        const parsedData = JSON.parse(data);
        console.log('Parsed API Response:', parsedData);
        res.status(200).json(parsedData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Error parsing API response', details: error.message, rawData: data });
      }
    });
  });

  request.on('error', (error) => {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Error fetching news', details: error.message });
  });

  request.end();
};
