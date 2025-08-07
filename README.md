# 💬 Waterfall Information Chatbot

A modern chatbot system built with Flask (Python) backend and JavaScript frontend that provides real-time information about waterfalls, emergency contacts, and weather alerts.

## 🌟 Features

### Chatbot Interface
- **Interactive Menu System**: Three main options for user interaction
- **Waterfall Status**: Real-time status of 6 major waterfalls including:
  - Coutrallam Main Falls
  - Coutrallam Old Falls
  - Tiger Falls
  - Chitraruvi
  - Palaruvi
  - Five Falls
- **Emergency Contacts**: Quick access to important contact information
- **Weather Alerts**: Live weather data from wttr.in API for Tenkasi region
- **Beautiful UI**: Modern chat interface with animations and responsive design

### Admin Panel
- **Secure Login**: Simple authentication system
- **Status Management**: Update waterfall open/closed status
- **Bathing Permissions**: Control bathing allowed/not allowed status
- **Real-time Updates**: Changes reflect immediately in the chatbot
- **User-friendly Dashboard**: Clean interface for managing all waterfalls

### Technical Features
- **RESTful API**: Clean API endpoints for all data operations
- **SQLite Database**: Lightweight database for storing waterfall and contact data
- **AJAX/Fetch**: Smooth data loading without page refreshes
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Error Handling**: Graceful error handling with user-friendly messages

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/waterfall-chatbot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 📱 Usage Guide

### For Users (Chatbot Interface)

1. **Access the Chatbot**: Open `http://localhost:5000`
2. **Select Options**: Choose from three main menu options:
   - **Waterfalls Status**: Check real-time status of individual waterfalls
   - **Emergency Contacts**: View important contact numbers
   - **Weather Alerts**: Get current weather information

3. **Navigate**: Use the interactive buttons to navigate through options
4. **Get Information**: Click on specific waterfalls to see detailed status

### For Administrators (Admin Panel)

1. **Access Admin Panel**: Go to `http://localhost:5000/admin`
2. **Login**: Use the admin key configured in your environment variables
3. **Update Statuses**: 
   - Check/uncheck "Open for visitors" for each waterfall
   - Check/uncheck "Bathing allowed" for each waterfall
4. **Save Changes**: Click "Update All Waterfall Statuses"
5. **View Changes**: Changes are immediately visible in the chatbot

## 🗄️ Database Schema

### Waterfalls Table
```sql
CREATE TABLE waterfalls (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    is_open BOOLEAN DEFAULT 1,
    bathing_allowed BOOLEAN DEFAULT 1,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Emergency Contacts Table
```sql
CREATE TABLE emergency_contacts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    phone_number TEXT NOT NULL
);
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /` - Main chatbot interface
- `GET /api/waterfalls` - List all waterfalls with status
- `GET /api/waterfall/<id>` - Get specific waterfall status
- `GET /api/emergency-contacts` - Get all emergency contacts
- `GET /api/weather-alerts` - Get current weather information

### Admin Endpoints
- `GET /admin` - Admin login page
- `GET /admin/dashboard` - Admin dashboard (requires authentication)
- `POST /admin/dashboard` - Update waterfall statuses (requires authentication)

## 🎨 Customization

### Adding New Waterfalls
1. Add the waterfall name to the `waterfalls` list in `app.py` (line ~45)
2. Restart the application - new waterfall will be automatically added to database

### Changing Weather Location
1. Modify the weather API URL in `app.py` (line ~125)
2. Replace 'Tenkasi' with your desired location

### Updating Emergency Contacts
1. Modify the `contacts` list in `app.py` (line ~55)
2. Restart the application to update the database

### Styling
- Main styles are in `templates/index.html` (embedded CSS)
- Admin styles are in respective template files
- Uses Bootstrap 5.1.3 and Font Awesome 6.0.0

## 🔒 Security Notes

### For Production Deployment:
1. **Change Secret Key**: Update `app.secret_key` in `app.py`
2. **Improve Authentication**: Replace simple admin key with proper user authentication
3. **Use Environment Variables**: Store sensitive data in environment variables
4. **Enable HTTPS**: Use SSL certificates for secure communication
5. **Database Security**: Consider using PostgreSQL or MySQL for production

## 🌐 Deployment Options

### Local Development
- Run with `python3 app.py`
- Access at `http://localhost:5000`

### 🚀 Render Deployment (Recommended)
This project is optimized for **Render.com** deployment:

1. **Quick Deploy**: Push to GitHub and deploy in minutes
2. **Free Tier Available**: Perfect for testing and small projects
3. **Auto-scaling**: Handles traffic automatically
4. **HTTPS Included**: Secure by default

**📋 Render Deployment Files Included:**
- `requirements.txt` - Python dependencies with gunicorn
- `build.sh` - Automated build script
- `Procfile` - Process configuration
- `render.yaml` - Infrastructure as code (optional)
- `RENDER_DEPLOYMENT.md` - Complete deployment guide

**🔗 Quick Start:**
1. Push code to GitHub
2. Connect repository to Render
3. Deploy with one click
4. Access your live chatbot!

**📖 Detailed Instructions:** See `RENDER_DEPLOYMENT.md`

### Other Cloud Platforms
- **Railway**: Simple Flask hosting
- **Heroku**: Popular cloud platform  
- **Replit**: Browser-based development and hosting

## 🛠️ Technologies Used

### Backend
- **Flask**: Python web framework
- **SQLite**: Lightweight database
- **Requests**: HTTP library for weather API
- **Jinja2**: Template engine

### Frontend
- **HTML5**: Structure and semantics
- **CSS3**: Styling with animations and gradients
- **JavaScript (ES6+)**: Interactive functionality
- **Bootstrap 5**: Responsive framework
- **Font Awesome**: Icons and visual elements

### APIs
- **wttr.in**: Weather information service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For support or questions:
- Check the code comments for implementation details
- Review the API endpoints for integration
- Test the admin panel for status management

---

**Built with ❤️ for waterfall enthusiasts and tourists**
