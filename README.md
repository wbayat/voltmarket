### 1. Start the database

From the project root run this to start PostgreSQL:

```bash
docker compose up -d
```

### 2. Set up the backend

```bash
cd backend
npm install
```

create a `.env` file:

```bash
cp .env.example .env
```

Generate a `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `JWT_SECRET` in your `.env`.

### 3. Run database migrations

```bash
npx prisma migrate dev
npx prisma generate
```

This creates all tables in your local Postgres database

### 4. Start the backend server using nodemon

```bash
npm run dev
```

Server runs at `http://localhost:5000` by default.

### 5. Insert dummy values in the tables

Run `node prisma/seed.js` to add dummy values into the db for testing.
Or use `npx prisma studio`.

### 6. Set up the frontend

Open a new terminal, keeping the backend running.

```bash
cd frontend
npm install
```

create a `.env` file:

```bash
cp .env.example .env
```

### 7. Start the frontend

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.
