# Auth

## Register

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "password": "supersecure123"}'
```

## Try registering the same email

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "password": "supersecure123"}'
```

## Try invalid input (should fail with 400)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "J", "email": "not-an-email", "password": "123"}'
```

## Login

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "supersecure123"}'
```

## Try logging in with the wrong password (should fail with 401)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "wrongpassword"}'
```

## Logout

```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/auth/logout
```

# Vehicle Catalog

## Get all vehicles

```bash
curl http://localhost:5000/api/vehicles
```

## Filter by brand

```bash
curl "http://localhost:5000/api/vehicles?brand=Tesla"
```

## Filter by color

```bash
curl "http://localhost:5000/api/vehicles?color=Black"
```

## Filter by price range

```bash
curl "http://localhost:5000/api/vehicles?minPrice=25000&maxPrice=45000"
```

## Sort by price ascending

```bash
curl "http://localhost:5000/api/vehicles?sortBy=price&order=asc"
```

## Sort by range descending

```bash
curl "http://localhost:5000/api/vehicles?sortBy=range&order=desc"
```

## Combine filter and sort

```bash
curl "http://localhost:5000/api/vehicles?brand=Tesla&sortBy=price&order=asc"
```

## Try an invalid sortBy field (should fall back to default createdAt order)

```bash
curl "http://localhost:5000/api/vehicles?sortBy=notARealField"
```

## Get a single vehicle by ID

```bash
curl http://localhost:5000/api/vehicles/1
```

## Try a non-existent vehicle ID (should fail with 404)

```bash
curl http://localhost:5000/api/vehicles/9999
```

## Get hot deals

```bash
curl http://localhost:5000/api/vehicles/hot-deals
```
