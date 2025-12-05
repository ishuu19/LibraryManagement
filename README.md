# Library Management System

A full-stack web application for managing library operations including book inventory, user management, and borrowing/returning functionality. Built with Vue.js 3 frontend and Express.js backend, using MongoDB as the database.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Features Overview](#features-overview)
- [Contributing](#contributing)

## ✨ Features

- **Book Management**: Complete CRUD operations for books (Create, Read, Update, Delete)
- **User Management**: Admin-controlled user management with role-based access
- **Borrow/Return System**: Track book borrowing and returning with history
- **Authentication & Authorization**: JWT-based authentication with admin and regular user roles
- **Search Functionality**: Search books by title, author, or other criteria
- **Responsive UI**: Modern, responsive interface built with Vue.js 3 and Bootstrap 5
- **Book Details**: View detailed information about each book
- **Borrow History**: Track borrowing history for both users and books

## 🛠 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Vite** - Next-generation frontend build tool
- **Bootstrap 5** - CSS framework for responsive design
- **Oruga UI** - Lightweight Vue.js components
- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **JWT (JSON Web Tokens)** - Authentication
- **Nodemon** - Development server with auto-reload
- **CORS** - Cross-origin resource sharing
- **EJS** - Embedded JavaScript templating

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.19.0 or >=22.12.0)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ishuu19/LibraryManagement.git
   cd LibraryManagement
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

## ⚙️ Configuration

### Backend Configuration

1. **MongoDB Connection**
   - Update the MongoDB connection string in `Backend/utils/db.js`
   - Or set the `MONGODB_URI` environment variable
   - Default: Uses MongoDB Atlas connection string

2. **Environment Variables** (Optional)
   - Create a `.env` file in the `Backend` directory if needed
   - Set `PORT` for custom port (default: 3000)
   - Set `MONGODB_URI` for database connection

### Frontend Configuration

- The frontend is configured to connect to the backend API
- Update API base URL in frontend if backend runs on a different port
- Default backend URL: `http://localhost:3000`

## 🏃 Running the Application

### Development Mode

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   The backend server will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

3. **Access the Application**
   - Open your browser and navigate to the frontend URL (typically `http://localhost:5173`)

### Production Mode

1. **Build the Frontend**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Start the Backend**
   ```bash
   cd Backend
   npm start
   ```

## 📁 Project Structure

```
LibraryManagement/
├── Backend/
│   ├── bin/
│   │   └── www                 # Server entry point
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── booksController.js
│   │   ├── borrowController.js
│   │   └── usersController.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── index.js
│   │   └── users.js
│   ├── utils/                  # Utility functions
│   │   ├── auth.js
│   │   ├── borrow.js
│   │   ├── db.js
│   │   ├── response.js
│   │   ├── tryCatch.js
│   │   └── users.js
│   ├── views/                  # EJS templates
│   ├── public/                 # Static files
│   ├── app.js                  # Express app configuration
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/         # Vue components
│   │   │   ├── BookCard.vue
│   │   │   ├── BookForm.vue
│   │   │   ├── LoginForm.vue
│   │   │   ├── Navbar.vue
│   │   │   └── ...
│   │   ├── views/              # Page components
│   │   │   ├── Home.vue
│   │   │   ├── BooksList.vue
│   │   │   ├── BookDetail.vue
│   │   │   ├── Login.vue
│   │   │   └── ...
│   │   ├── router/             # Vue Router configuration
│   │   │   └── index.js
│   │   ├── App.vue             # Root component
│   │   └── main.js             # Application entry point
│   ├── public/                 # Static assets
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Books
- `GET /api/books` - Get all books (supports query params: `homepage=true`, `search`, `page`, `limit`)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (requires authentication)
- `PUT /api/books/:id` - Update book (requires authentication)
- `DELETE /api/books/:id` - Delete book (requires authentication)

### Borrowing
- `POST /api/books/:id/borrow` - Borrow a book (requires authentication)
- `POST /api/books/:id/return` - Return a book (requires authentication)
- `GET /api/books/:id/borrow-history` - Get borrow history for a book (requires authentication)

### Users
- `GET /api/users` - Get all users (requires authentication, admin only)
- `GET /api/users/:id` - Get user by ID (requires authentication, admin only)
- `POST /api/users` - Create new user (requires authentication, admin only)
- `PUT /api/users/:id` - Update user (requires authentication, admin only)
- `DELETE /api/users/:id` - Delete user (requires authentication, admin only)
- `GET /api/users/:id/borrow-history` - Get borrow history for a user (requires authentication, admin only)

## 📖 Features Overview

### For Regular Users
- Browse and search books
- View book details
- Borrow and return books
- View personal borrow history
- Login/Logout functionality

### For Administrators
- All regular user features
- Add, edit, and delete books
- Manage users (CRUD operations)
- View all borrow histories
- Access admin-only routes

## 🧪 Testing

### Frontend Tests
```bash
cd Frontend
npm run test:unit
```

### Linting
```bash
# Frontend
cd Frontend
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **ishuu19** - [GitHub](https://github.com/ishuu19)

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Express.js for the robust backend framework
- MongoDB for the flexible database solution
- Bootstrap for the responsive UI components

---

For more information or issues, please visit the [GitHub repository](https://github.com/ishuu19/LibraryManagement).
