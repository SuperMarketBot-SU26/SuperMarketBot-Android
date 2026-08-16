const fetch = require('node-fetch');

async function testSearch() {
  const BASE_URL = 'http://10.0.2.2:5000';
  try {
    const url = `${BASE_URL}/api/search?q=Thịt&limit=20&sortBy=relevance&useAi=false`;
    console.log(`GET ${url}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}

testSearch();
