const axios = require('axios');

export async function handler(event) {
  try {
    const symbol = event.queryStringParameters.symbol;
    const apiKey = process.env.ALPHAVANTAGE_API_KEY; // Using the environment variable
    
    if (!apiKey) {
      throw new Error('API key is not defined');
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`
    ).then((response) => {
      return response.data;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    // Output error to netlify function log
    // console.log(JSON.stringify(err));
    return {
      statusCode: 500,
      body: JSON.stringify({ code: "getInstruments error", error: JSON.stringify(err) }),
    };
  }
}
