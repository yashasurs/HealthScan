# Full-Stack Application

A modern web application with a React (Vite) frontend and FastAPI backend.

## Project Structure

```
project-root/
├── client/            # React (Vite) frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/            # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (v3.8 or later)
- [pip](https://pip.pypa.io/en/stable/)
- [Git](https://git-scm.com/)

## Installation

### Clone the Repository

```bash
git clone https://github.com/aneeshsunganahalli/ProjectSunga.git
cd your-project-name
```

### Backend Setup (FastAPI)

1. Navigate to the server directory:

```bash
cd server
```

2. Create a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install the dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the server directory (if not already present):

```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
ENVIRONMENT=development
```

5. Start the FastAPI server:

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Or if you have a specific entry point defined
python -m app.main
```

The API will be available at `http://localhost:8000`. 
API documentation is automatically available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup (React - Vite)

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
# Using npm
npm install

# Or using yarn
yarn
```

3. Create a `.env` file in the client directory (if needed):

```
VITE_API_URL=http://localhost:8000
```

4. Start the development server:

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The React application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Running Both Services Simultaneously

You can use a tool like [Concurrently](https://www.npmjs.com/package/concurrently) to run both the frontend and backend with a single command.

1. Install Concurrently globally:

```bash
npm install -g concurrently
```

2. Add a script in the root package.json (create one if it doesn't exist):

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "scripts": {
    "start": "concurrently \"cd server && python -m uvicorn app.main:app --reload\" \"cd client && npm run dev\""
  }
}
```

3. Run both services:

```bash
npm start
```

## Building for Production

### Backend

The FastAPI application can be deployed using various methods:

1. Using Gunicorn with Uvicorn workers (recommended for production):

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

2. Or using a Docker container (Dockerfile should be created in the server directory).

### Frontend

To build the React application for production:

```bash
cd client

# Using npm
npm run build

# Or using yarn
yarn build
```

The build files will be in the `client/dist` directory, which can be served by any static file server.

## Environment Variables

### Backend (.env in server directory)

- `DATABASE_URL`: Connection URL for your database
- `SECRET_KEY`: Secret key for JWT token generation and validation
- `ENVIRONMENT`: Development, testing, or production

### Frontend (.env in client directory)

- `VITE_API_URL`: URL of the backend API

## API Endpoints

Document your API endpoints here, for example:

- `GET /api/items`: Retrieve all items
- `POST /api/items`: Create a new item
- `PUT /api/items/{id}`: Update an item
- `DELETE /api/items/{id}`: Delete an item

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## License

This project is licensed under the [MIT License](LICENSE).