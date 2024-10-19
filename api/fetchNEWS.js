const https = require('https');
const { URL } = require('url');

const MAX_REQUESTS_PER_MINUTE = 10;
const requestCounts = new Map();

module.exports = (req, res) => {
  const { topic = 'AI & Wellness', pageSize = 5, sortBy = 'publishedAt' } = req.query;
  const newsApiKey = process.env.NEWS_API_KEY;

  // Input validation
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const currentMinute = Math.floor(Date.now() / 60000);
  const clientRequests = requestCounts.get(clientIp) || { count: 0, minute: currentMinute };

  if (clientRequests.minute === currentMinute) {
    if (clientRequests.count >= MAX_REQUESTS_PER_MINUTE) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    clientRequests.count++;
  } else {
    clientRequests.count = 1;
    clientRequests.minute = currentMinute;
  }
  requestCounts.set(clientIp, clientRequests);

  console.log('Received topic:', topic);
  console.log('API Key:', newsApiKey ? 'Present' : 'Missing');

  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.append('q', topic);
  url.searchParams.append('apiKey', newsApiKey);
  url.searchParams.append('language', 'en');
  url.searchParams.append('pageSize', pageSize);
  url.searchParams.append('sortBy', sortBy);

  console.log('Request URL:', url.toString());

  const options = {
    headers: { 'User-Agent': 'NewsAPIClient/1.0' }
  };

  https.get(url, options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('Raw API Response:', data);
      try {
        const parsedData = JSON.parse(data);
        console.log('Parsed API Response:', parsedData);
        
        if (response.statusCode === 200) {
          res.status(200).json(parsedData);
        } else {
          res.status(response.statusCode).json({ error: 'News API error', details: parsedData });
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Error parsing API response', details: error.message, rawData: data });
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Error fetching news', details: error.message });
  });
};
