# 🚀 Render Deployment Guide - Waterfall Chatbot

This guide will help you deploy the Waterfall Information Chatbot on Render.com.

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Code Repository** - Push all the project files to your GitHub repository

## 📁 Required Files for Render

Your repository should contain these files (already included):

```
waterfall-chatbot/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── build.sh              # Build script for Render
├── Procfile              # Process file (alternative)
├── render.yaml           # Render configuration (optional)
├── templates/            # HTML templates
│   ├── index.html
│   ├── admin_login.html
│   └── admin_dashboard.html
├── README.md
└── RENDER_DEPLOYMENT.md  # This file
```

## 🚀 Deployment Steps

### Method 1: Using Render Dashboard (Recommended)

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your chatbot code

3. **Configure the Service**
   ```
   Name: waterfall-chatbot (or your preferred name)
   Environment: Python 3
   Region: Choose closest to your users
   Branch: main (or your default branch)
   Build Command: ./build.sh
   Start Command: gunicorn --bind 0.0.0.0:$PORT app:app
   ```

4. **Set Environment Variables**
   - `PYTHON_VERSION`: `3.11.0`
   - `SECRET_KEY`: Click "Generate" for a secure random key
   - `RENDER`: `true`

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for the build to complete (usually 2-5 minutes)

### Method 2: Using render.yaml (Infrastructure as Code)

1. **Push Code with render.yaml**
   - The `render.yaml` file is already configured
   - Just push to GitHub and Render will auto-detect the configuration

2. **Create Service from Dashboard**
   - Render will read the `render.yaml` file automatically
   - All settings will be pre-configured

## 🔧 Configuration Details

### Environment Variables
- **PORT**: Set automatically by Render
- **SECRET_KEY**: Generate a secure key in Render dashboard
- **PYTHON_VERSION**: 3.11.0 (recommended)
- **RENDER**: Set to `true` to enable production mode

### Build Process
The `build.sh` script will:
1. Update pip to the latest version
2. Install Python dependencies from `requirements.txt`
3. Initialize the SQLite database with sample data

### Start Command
```bash
gunicorn --bind 0.0.0.0:$PORT app:app
```

## 🌐 Access Your Deployed App

After successful deployment:

1. **Main Chatbot Interface**: `https://your-app-name.onrender.com`
2. **Admin Panel**: `https://your-app-name.onrender.com/admin`
   - Admin Key: `admin123`

### API Endpoints
- `GET /api/waterfalls` - List all waterfalls
- `GET /api/waterfall/<id>` - Get specific waterfall status
- `GET /api/emergency-contacts` - Get emergency contacts
- `GET /api/weather-alerts` - Get weather information

## 🔒 Security Considerations

### For Production Use:
1. **Change Admin Key**: Update the admin authentication in `app.py`
2. **Use Strong Secret Key**: Let Render generate a secure SECRET_KEY
3. **Environment Variables**: Store sensitive data in Render's environment variables
4. **HTTPS**: Render provides HTTPS automatically

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Render dashboard
   - Ensure `build.sh` has execute permissions
   - Verify `requirements.txt` has correct package versions

2. **App Won't Start**
   - Check if `gunicorn` is installed
   - Verify the start command is correct
   - Check application logs in Render dashboard

3. **Database Issues**
   - SQLite database is created automatically on first run
   - Check build logs to ensure database initialization completed

4. **Weather API Not Working**
   - The weather API (wttr.in) should work automatically
   - Check application logs if weather data isn't loading

### Viewing Logs:
- Go to Render Dashboard → Your Service → Logs
- Check both Build logs and Deploy logs

## 💰 Render Pricing

- **Free Tier**: Perfect for this chatbot
  - 750 hours/month of runtime
  - Automatic sleep after 15 minutes of inactivity
  - Automatic wake-up on incoming requests

- **Paid Plans**: For production use
  - Always-on service (no sleeping)
  - Custom domains
  - More resources

## 🔄 Updates and Redeployment

### Automatic Deployment:
- Push changes to your GitHub repository
- Render will automatically rebuild and redeploy
- No manual intervention needed

### Manual Deployment:
- Go to Render Dashboard → Your Service
- Click "Manual Deploy" → "Deploy latest commit"

## 📱 Testing Your Deployment

1. **Test Chatbot Interface**
   - Visit your Render URL
   - Try all three menu options
   - Check waterfall status updates

2. **Test Admin Panel**
   - Go to `/admin`
   - Login with `admin123`
   - Update waterfall statuses
   - Verify changes appear in chatbot

3. **Test API Endpoints**
   ```bash
   curl https://your-app-name.onrender.com/api/waterfalls
   curl https://your-app-name.onrender.com/api/emergency-contacts
   curl https://your-app-name.onrender.com/api/weather-alerts
   ```

## 🎉 Success!

Your Waterfall Information Chatbot is now live on Render! 

### Share Your App:
- **Public URL**: `https://your-app-name.onrender.com`
- **Admin Access**: `https://your-app-name.onrender.com/admin`

### Next Steps:
1. Customize the waterfall data for your specific location
2. Add more emergency contacts
3. Enhance the UI with your branding
4. Consider upgrading to a paid plan for production use

## 📞 Support

If you encounter issues:
1. Check Render's documentation: [render.com/docs](https://render.com/docs)
2. Review the application logs in Render dashboard
3. Test locally first to isolate deployment-specific issues

---

**Happy Deploying! 🚀**