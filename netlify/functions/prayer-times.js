// Simple Netlify Function to fetch RSS feed
// This runs server-side so no CORS issues

exports.handler = async (event, context) => {
  const RSS_URL = 'https://namazvakti.com/DailyRSS.php?cityID=18236';
  
  try {
    // Fetch the RSS feed
    const response = await fetch(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the XML text
    const xmlText = await response.text();
    
    // Extract prayer times from the description
    const descriptionMatch = xmlText.match(/<description>\s*([\s\S]*?)\s*<\/description>/);
    
    if (!descriptionMatch) {
      throw new Error('Could not find description in RSS');
    }
    
    const description = descriptionMatch[1];
    
    // Parse prayer times: "İmsâk : 05:28"
    const times = {};
    const lines = description.split(/<br>|<p>/).filter(line => line.trim());
    
    lines.forEach(line => {
      const match = line.match(/([^:]+)\s*:\s*(\d{2}:\d{2})/);
      if (match) {
        const name = match[1].trim();
        const time = match[2].trim();
        times[name] = time;
      }
    });
    
    // Return the prayer times as JSON
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify({
        success: true,
        times: times,
        rawDescription: description
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
