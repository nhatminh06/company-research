# Company Searcher

A modern full-stack web application for managing and tracking companies that align with your career goals and professional interests.

## Features

- **Home Page**: Welcome page with application overview
- **Dashboard**: Create, read, update, and delete company notes
- **About Page**: Information about the application and technology stack
- **Resume Builder**: Professional resume creation tool with form-based input

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd company-searcher
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/company-searcher
   NODE_ENV=development
   ```
   
   If you're using MongoDB Atlas, replace the MONGO_URI with your connection string.

## Running the Application

### Development Mode (Recommended)
Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

- `GET /api` - Welcome message
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Project Structure

```
company-searcher/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── About.jsx
│   │   │   └── Resume.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── controllers/
│   │   └── noteController.js
│   ├── models/
│   │   └── Note.js
│   ├── routes/
│   │   └── noteRoutes.js
│   ├── server.js
│   └── package.json
└── package.json
```

## Usage

1. **Home Page**: Navigate to see the application overview
2. **Dashboard**: Add, edit, and manage your company notes
3. **About**: Learn more about the application
4. **Resume**: Build your professional resume

## Development

### Adding New Features
- Frontend components go in `frontend/src/components/`
- Pages go in `frontend/src/pages/`
- Backend routes go in `backend/routes/`
- Controllers go in `backend/controllers/`
- Models go in `backend/models/`

### Database Schema
The Note model includes:
- `title` (required): Company name
- `content`: Notes about the company
- `createdAt`: Timestamp

## Troubleshooting

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running locally or your Atlas connection string is correct
   - Check the `.env` file in the backend directory

2. **Port Conflicts**
   - Backend runs on port 5000 by default
   - Frontend runs on port 5173 by default
   - Update ports in respective `.env` files if needed

3. **CORS Issues**
   - Backend has CORS enabled for development
   - Frontend proxy is configured in `vite.config.js`

## License

ISC 