# 🚴‍♂️ Bike Buddy !

A comprehensive bike service management platform that connects customers with service providers, enabling easy booking, tracking, and management of bike services.


## 🎯 Overview

Bike Byuddy is a full-stack web application designed to streamline bike service operations. It provides separate dashboards for customers and service owners, with real-time status updates and email notifications.

### Key Highlights
- **Role-based Access**: Separate interfaces for customers and service owners
- **Real-time Updates**: Live status tracking for service bookings
- **Email Notifications**: Automated email alerts for status changes
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Secure Authentication**: Password hashing and user session management

## ✨ Features

### For Customers
- 🔐 **User Authentication**: Secure login and registration
- 📅 **Service Booking**: Easy booking of bike services with date selection
- 📊 **Dashboard**: Comprehensive overview of bookings and statistics
- 📈 **Service History**: Complete history of past services
- 🔔 **Status Tracking**: Real-time tracking of service status
- 📧 **Email Notifications**: Automatic updates on service progress
- 💰 **Cost Tracking**: Monitor total spending on services

### For Service Owners
- 📋 **Booking Management**: View and manage all customer bookings
- 🔄 **Status Updates**: Update booking statuses (Pending, In Progress, Ready for Delivery, Completed)
- 👥 **Customer Management**: Access to customer details and service history
- 📊 **Analytics Dashboard**: Overview of business metrics and performance
- 🛠️ **Service Management**: Add, edit, and manage available services
- 📧 **Automated Communications**: Automatic email notifications to customers

### General Features
- 🌐 **Cross-platform**: Works on desktop, tablet, and mobile devices
- ⚡ **Fast Performance**: Optimized loading times and smooth interactions
- 🔒 **Data Security**: Secure data handling with encrypted passwords
- 🎨 **Modern UI**: Clean, intuitive interface with Material-UI components

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI library
- **React Router** - Client-side routing
- **Material-UI** - Modern React UI components
- **CSS3** - Custom styling and responsive design
- **Fetch API** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Nodemailer** - Email sending functionality
- **bcrypt** - Password hashing (for secure authentication)
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### Additional Tools
- **JWT** - JSON Web Tokens for authentication (if implemented)
- **Gmail SMTP** - Email service integration

## 📁 Project Structure

```
Cartrabbit/
├── client/                     # React frontend
│   ├── public/                 # Static files
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── auth/           # Authentication components
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── customer/       # Customer-specific components
│   │   │   │   ├── CustomerDashboard.js
│   │   │   │   ├── BookService.js
│   │   │   │   └── ServiceHistory.js
│   │   │   ├── owner/          # Owner-specific components
│   │   │   │   ├── OwnerDashboard.js
│   │   │   │   ├── BookingsManagement.js
│   │   │   │   ├── OrdersPage.js
│   │   │   │   └── ServicesManagement.js
│   │   │   ├── LoadingScreen.js
│   │   │   └── Navbar.js
│   │   ├── styles/             # CSS files
│   │   ├── App.js              # Main App component
│   │   └── index.js            # React entry point
│   └── package.json            # Frontend dependencies
├── server/                     # Node.js backend
│   ├── config/                 # Configuration files
│   │   ├── db.js               # Database connection
│   │   └── cors.js             # CORS configuration
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Booking.js
│   │   ├── Service.js
│   │   └── Car.js
│   ├── routes/                 # API routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── bookings.js         # Booking management
│   │   └── services.js         # Service management
│   ├── app.js                  # Express server setup
│   └── package.json            # Backend dependencies
└── README.md                   # Project documentation
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/Sabari-Vasan-SM/Cartrabbit.git
cd Cartrabbit
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/cartrabbit
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create a `.env` file in the client directory (if needed):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the Application

Start the backend server:
```bash
cd server
npm start
```

Start the frontend development server:
```bash
cd ../client
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 💻 Usage

### Customer Workflow
1. **Register/Login** as a customer
2. **Browse Services** available on the platform
3. **Book a Service** by providing necessary details
4. **Track Status** through the dashboard
5. **Receive Email Updates** as service progresses
6. **View History** of all past services

### Owner Workflow
1. **Login** as a service owner
2. **View All Bookings** in the management dashboard
3. **Update Status** of ongoing services
4. **Manage Services** offered to customers
5. **Monitor Analytics** and business metrics

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Bookings
- `GET /api/bookings` - Get all bookings (with optional email filter)
- `POST /api/bookings` - Create a new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete a booking

### Services
- `GET /api/services` - Get all available services
- `POST /api/services` - Create a new service (owner only)
- `PUT /api/services/:id` - Update a service (owner only)
- `DELETE /api/services/:id` - Delete a service (owner only)

## 🔐 Environment Variables

### Server (.env)
```env
MONGO_URI=your-mongodb-connection-string
SMTP_USER=your-gmail-address
SMTP_PASS=your-gmail-app-password
PORT=5000
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sabari Vasan SM**
- GitHub: [@Sabari-Vasan-SM](https://github.com/Sabari-Vasan-SM)

## 🙏 Acknowledgments

- Material-UI for the beautiful UI components
- Node.js and React.js communities for excellent documentation
- MongoDB for the flexible database solution
- Nodemailer for seamless email integration

---

⭐ If you found this project helpful, please give it a star!
