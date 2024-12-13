require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const puppeteer = require('puppeteer');
const validator = require('validator');
const winston = require('winston');
const path = require('path');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Setup Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Initialize cache
const screenshotCache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 3600,
  checkperiod: 120
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add this helper function near the top of server.js
function normalizeUrl(url) {
  try {
    // Remove leading/trailing whitespace
    url = url.trim();
    
    // Log the incoming URL
    logger.info('Incoming URL:', url);
    
    // Check if URL already has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Default to https if no protocol specified
      url = 'https://' + url;
      logger.info('Added protocol:', url);
    }
    
    // Validate the normalized URL (after adding protocol)
    try {
      new URL(url); // This will throw if invalid
      logger.info('Valid URL:', url);
      return url;
    } catch (urlError) {
      logger.error('Invalid URL after normalization:', url);
      throw new Error('Invalid URL provided');
    }
  } catch (error) {
    logger.error('URL normalization error:', error);
    throw error;
  }
}

// Screenshot endpoint
app.get('/api/screenshot', async (req, res) => {
  try {
    console.log('Full request query:', req.query);  // Debug log
    console.log('URL from query:', req.query.url);  // Debug log
    console.log('Request headers:', req.headers);   // Debug log

    const rawUrl = req.query.url;
    
    // If URL is undefined or null, log that specifically
    if (rawUrl === undefined) console.log('URL is undefined');
    if (rawUrl === null) console.log('URL is null');
    if (rawUrl === '') console.log('URL is empty string');

    const width = parseInt(req.query.width) || 1920;
    const height = parseInt(req.query.height) || 1080;

    if (!rawUrl) {
      logger.error('No URL provided in request');
      return res.status(400).json({ 
        error: 'URL parameter is required',
        received: rawUrl,
        queryParams: req.query
      });
    }

    // Test log the raw URL
    console.log('Raw URL received:', rawUrl);

    logger.info('Processing URL:', rawUrl);
    const normalizedUrl = normalizeUrl(rawUrl);
    
    // Check cache
    const cacheKey = `${normalizedUrl}-${width}-${height}`;
    const cachedScreenshot = screenshotCache.get(cacheKey);
    if (cachedScreenshot) {
      return res.json({ image: cachedScreenshot, cached: true });
    }

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: width,
      height: height
    });

    // Navigate to URL with timeout
    await page.goto(normalizedUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Capture screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      encoding: 'base64'
    });

    await browser.close();

    // Cache the screenshot
    screenshotCache.set(cacheKey, screenshot);

    res.json({ image: screenshot, cached: false });
  } catch (error) {
    logger.error('Screenshot error:', error);
    res.status(500).json({
      error: 'Failed to capture screenshot',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 