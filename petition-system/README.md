# Tenkasi District Petition Redressal System

A comprehensive web application for managing citizen petitions and official responses in Tenkasi district, featuring role-based access for public users, officials, and administrators.

## 🚀 Features

### Public Features (No Login Required)
- **Easy Petition Submission**: Submit petitions directly without registration
- **Real-time Tracking**: Track petition status using unique petition ID
- **Transparent Process**: View official responses and status updates
- **Mobile Responsive**: Optimized for mobile and desktop devices

### Official Features
- **Dashboard**: View and manage assigned petitions
- **Status Management**: Update petition status and priority
- **Response System**: Add official responses to petitions
- **Analytics**: View petition statistics and trends

### Admin Features
- **Advanced Analytics**: Comprehensive system reports and metrics
- **System Management**: Delete petitions and perform system cleanup
- **Data Export**: Export petition data in CSV format
- **Health Monitoring**: System health and performance metrics

## 🛠️ Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT-based with unique access codes
- **Hosting**: Render (recommended)
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd petition-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb petition_system

# Set up environment variables
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/petition_system
JWT_SECRET=your-secret-key-here
OFFICIAL_LOGIN_CODE=tgbvfrertyu4820
ADMIN_LOGIN_CODE=nbcfeodkms934
```

### 4. Run Database Migrations
```bash
cd backend
npm run migrate
```

### 5. Start the Application
```bash
# Development mode (from root directory)
npm run dev

# Or start services separately:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Authentication

### Access Codes
- **Official Login**: `tgbvfrertyu4820`
- **Admin Login**: `nbcfeodkms934`

*Note: In production, these codes should be kept secure and not exposed.*

## 🗂️ Project Structure

```
petition-system/
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication & validation
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API utilities
│   │   └── App.js       # Main app component
│   └── package.json
├── database/             # Database migrations
└── README.md
```

## 🔌 API Endpoints

### Public Endpoints
- `POST /api/petitions` - Submit new petition
- `GET /api/petitions/track/:petition_id` - Track petition by ID

### Authentication
- `POST /api/auth/login` - Official/Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Protected Endpoints (Official/Admin)
- `GET /api/petitions` - Get all petitions with filters
- `GET /api/petitions/:id` - Get specific petition
- `PUT /api/petitions/:id/status` - Update petition status
- `POST /api/petitions/:id/response` - Add official response
- `GET /api/petitions/stats/overview` - Get statistics

### Admin Only Endpoints
- `DELETE /api/admin/petitions/:id` - Delete petition
- `GET /api/admin/analytics` - Get comprehensive analytics
- `GET /api/admin/reports/export` - Export data
- `POST /api/admin/system/cleanup` - System cleanup
- `GET /api/admin/system/health` - System health check

## 🚀 Deployment on Render

### Automatic Deployment
1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` configuration
3. Services will be deployed automatically

### Manual Setup
1. Create a new PostgreSQL database on Render
2. Create a new Web Service for the backend:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Add environment variables from `.env.example`
3. Create a new Static Site for the frontend:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

### Environment Variables
Set these in your Render dashboard:

**Backend Service:**
```
NODE_ENV=production
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<generate-random-secret>
OFFICIAL_LOGIN_CODE=tgbvfrertyu4820
ADMIN_LOGIN_CODE=nbcfeodkms934
FRONTEND_URL=<your-frontend-url>
```

**Frontend Service:**
```
REACT_APP_API_URL=<your-backend-api-url>
```

## 📊 Database Schema

### Petitions Table
- `id` - Primary key
- `petition_id` - Unique petition ID (TNK-YYYY-XXX)
- `from_name` - Petitioner name
- `to_department` - Target department
- `whatsapp_number` - Contact number
- `petition_text` - Petition content
- `status` - Current status (pending/in_progress/resolved/rejected)
- `priority` - Priority level (low/normal/high/urgent)
- `created_at` - Submission timestamp
- `updated_at` - Last update timestamp

### Responses Table
- `id` - Primary key
- `petition_id` - Foreign key to petitions
- `response_text` - Official response
- `response_date` - Response timestamp
- `is_final` - Whether this is the final response
- `responded_by` - Role of responder (official/admin)

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Follow React and Node.js best practices

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check login codes in environment variables
   - Clear browser localStorage if needed

3. **CORS Issues**
   - Ensure FRONTEND_URL is correctly set in backend
   - Check API URL configuration in frontend

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Public petition submission and tracking
  - Official and admin authentication
  - Basic petition management
  - Render deployment configuration

## 🎯 Future Enhancements

- WhatsApp API integration for notifications
- Email notification system
- Document attachment support
- Mobile app version
- Multi-language support (Tamil/English)
- Advanced reporting dashboard
- SMS integration
- Real-time notifications

---

**Tenkasi District Petition Redressal System** - Streamlining citizen services through technology.