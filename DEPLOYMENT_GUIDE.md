# Multi-AI ChatBot Deployment Guide

## Backend Deployment

### Option 1: Deploy to Vercel (Serverless)
1. Install Vercel CLI: npm i -g vercel
2. Navigate to backend folder: cd backend
3. Run: vercel --prod
4. Set environment variables in Vercel dashboard

### Option 2: Deploy to Render (Web Service)
1. Push code to GitHub
2. Connect repository to Render
3. Set build command: pip install -r requirements.txt
4. Set start command: gunicorn app:app
5. Set environment variables in Render dashboard

## Frontend Deployment

### Deploy to Vercel (Static Hosting)
1. Navigate to frontend folder: cd frontend
2. Run: vercel --prod
3. Update API endpoints in config.js

## Environment Variables

### Backend (.env)
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=production
ALLOWED_ORIGINS=https://your-frontend-app.vercel.app

### Important Notes
- Update CORS origins with your actual frontend URL
- Replace placeholder URLs in config.js
- Test API endpoints after deployment
