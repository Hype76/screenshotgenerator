import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  console.log('Screenshot request received for URL:', req.query.url);

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' https: 'unsafe-inline'; script-src 'self'; connect-src 'self'"
  );

  try {
    const { url } = req.query;

    if (!url) {
      console.log('No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (error) {
      console.log('Invalid URL format:', error);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      console.log('Browser page created');
      
      await page.setViewport({
        width: 1920,
        height: 1080
      });

      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      console.log('Navigating to:', fullUrl);
      
      await page.goto(fullUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      console.log('Page loaded');

      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true
      });
      console.log('Screenshot captured');

      const base64Image = screenshot.toString('base64');
      console.log('Image converted to base64, length:', base64Image.length);

      res.status(200).json({ image: base64Image });
      console.log('Response sent successfully');

    } finally {
      await browser.close();
      console.log('Browser closed');
    }

  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ 
      error: 'Failed to capture screenshot',
      details: error.message 
    });
  }
} 