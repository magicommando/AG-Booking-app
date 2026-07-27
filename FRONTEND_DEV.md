Frontend development quickstart
=============================

1) Backend

- Ensure you have a local `backend/.env` with required variables (do not commit).
- Start the backend (from project root):

```
node server.js
```

Or with nodemon (if installed):

```
npx nodemon server.js
```

2) Frontend (Create React App)

- Set the API base URL for development in `frontend/.env.development` (create if missing):

```
REACT_APP_API_URL=http://localhost:5000
```

- Start the frontend (from `frontend/`):

```
cd frontend
npm install
npm start
```

3) Notes

- The frontend uses `src/services/api.js` which reads `REACT_APP_API_URL`.
- The backend has CORS enabled by default for local development.
- Keep sensitive keys in `backend/.env` and do not commit them. Use `backend/.env.example` as a template.
