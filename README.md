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


