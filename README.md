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
