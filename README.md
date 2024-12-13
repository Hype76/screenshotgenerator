# Website Screenshot Tool

A simple tool to capture full-page screenshots of websites.

## Features

- Capture full-page screenshots of any website
- Simple and intuitive interface
- Responsive design
- Real-time preview

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://
   cd webscreenshot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CACHE_TTL=3600
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a URL in the input field
3. Click "Capture Screenshot"
4. Wait for the screenshot to be generated
5. Download or share the captured screenshot

## API Endpoints

### GET /api/screenshot
Captures a screenshot of the specified URL.

Query Parameters:
- `url` (required): The URL to capture
- `width` (optional): Viewport width (default: 1920)
- `height` (optional): Viewport height (default: 1080)

## Security

- Input sanitization
- Rate limiting
- CORS policies
- Security headers via Helmet
- XSS protection

## Testing

Run the test suite:
```bash
npm test
```

## License

MIT License - see LICENSE file for details 

## Deployment

This project is configured for deployment on Netlify:

1. Push your code to GitHub
2. Log in to Netlify
3. Click "New site from Git"
4. Choose your repository
5. Build settings will be automatically configured via netlify.toml
6. Click "Deploy site"

Environment Variables needed on Netlify:
- None required for basic functionality 