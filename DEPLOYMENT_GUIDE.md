# BFHL API Deployment Guide

This guide will help you deploy your BFHL API to various hosting platforms.

## 🚀 Quick Start

### 1. Local Testing
First, test your API locally:

```bash
# Start the server
npm run server

# In another terminal, test the API
npm run test:bfhl
```

### 2. API Endpoint
Your API will be available at: `http://localhost:5001/bfhl`

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json configuration:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/bfhl",
         "dest": "/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Your API will be available at:** `https://your-project.vercel.app/bfhl`

### Option 2: Railway (Free Tier Available)

1. **Create Railway account:** https://railway.app

2. **Connect your GitHub repository**

3. **Add environment variables:**
   - `NODE_ENV=production`
   - `PORT=5001`

4. **Deploy automatically from GitHub**

5. **Your API will be available at:** `https://your-project.railway.app/bfhl`

### Option 3: Render (Free Tier Available)

1. **Create Render account:** https://render.com

2. **Create a new Web Service**

3. **Connect your GitHub repository**

4. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node

5. **Add environment variables:**
   - `NODE_ENV=production`
   - `PORT=5001`

6. **Your API will be available at:** `https://your-project.onrender.com/bfhl`

### Option 4: Heroku (Paid)

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app:**
   ```bash
   heroku create your-bfhl-api
   ```

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Add BFHL API"
   git push heroku main
   ```

4. **Your API will be available at:** `https://your-bfhl-api.herokuapp.com/bfhl`

## 📝 Environment Variables

Create a `.env` file for local development:

```env
NODE_ENV=development
PORT=5001
```

For production, set these in your hosting platform's dashboard.

## 🧪 Testing Your Deployed API

### Using curl:
```bash
curl -X POST https://your-api-url.com/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["a","1","334","4","R", "$"]}'
```

### Using Postman:
1. Set method to `POST`
2. URL: `https://your-api-url.com/bfhl`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "data": ["a","1","334","4","R", "$"]
   }
   ```

### Using JavaScript:
```javascript
const response = await fetch('https://your-api-url.com/bfhl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: ["a","1","334","4","R", "$"]
  })
});

const result = await response.json();
console.log(result);
```

## 🔧 Customization

### Update User Information
In `server.js`, modify these lines in the `/bfhl` endpoint:

```javascript
// Generate user_id (customize this)
const fullName = "your_full_name"; // Replace with your name
const today = new Date();
const day = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0');
const year = today.getFullYear();
const user_id = `${fullName}_${day}${month}${year}`;

// Update email and roll number
email: "your.email@example.com", // Replace with your email
roll_number: "YOUR_ROLL_NUMBER", // Replace with your roll number
```

## 📊 API Response Format

Your API will return responses in this format:

```json
{
  "is_success": true,
  "user_id": "john_doe_17091999",
  "email": "john@xyz.com",
  "roll_number": "ABCD123",
  "odd_numbers": ["1"],
  "even_numbers": ["334", "4"],
  "alphabets": ["A", "R"],
  "special_characters": ["$"],
  "sum": "339",
  "concat_string": "Ra"
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```bash
   # Kill process using port 5001
   lsof -ti:5001 | xargs kill -9
   ```

2. **CORS issues:**
   - The API already includes CORS configuration
   - If issues persist, check your hosting platform's CORS settings

3. **Environment variables not loading:**
   - Ensure `.env` file is in the root directory
   - Check that `dotenv` is loaded at the top of `server.js`

4. **Deployment fails:**
   - Check that all dependencies are in `package.json`
   - Ensure `server.js` is the main entry point
   - Verify Node.js version compatibility

## 📞 Support

If you encounter any issues:
1. Check the logs in your hosting platform's dashboard
2. Test locally first using `npm run test:bfhl`
3. Verify your API endpoint is accessible

## 🎯 Next Steps

1. **Deploy to your chosen platform**
2. **Test with the provided examples**
3. **Submit your API endpoint URL to the form**
4. **Monitor your API's performance**

Good luck with your submission! 🚀

