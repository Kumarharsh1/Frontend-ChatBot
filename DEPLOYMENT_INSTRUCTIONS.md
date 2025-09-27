# ?? Deployment Instructions

## Backend Deployment

### Option 1: Vercel (Recommended for Serverless)
1. Navigate to backend folder: \cd backend\
2. Install Vercel CLI: \
pm i -g vercel\
3. Deploy: \ercel --prod\
4. Set environment variables in Vercel dashboard

### Option 2: Render (Web Service)
1. Push code to GitHub
2. Connect repo to Render.com
3. Set build command: \pip install -r requirements.txt\
4. Set start command: \gunicorn app:app\
5. Set environment variables

## Frontend Deployment

1. Navigate to frontend folder: \cd frontend\
2. Deploy to Vercel: \ercel --prod\
3. Update \config.js\ with your actual backend URL

## Environment Variables

### Backend (.env)
GROQ_API_KEY=your_groq_api_key_here
FLASK_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

## Important Notes

1. After deploying backend, update \rontend/config.js\ with your actual backend URL
2. Test locally first: run backend with \python app.py\ and open frontend in browser
3. The app will automatically use localhost:5000 for development and your production URL when deployed
