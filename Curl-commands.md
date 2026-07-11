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

# Review

## Create a review (You have to be logged in)

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 17, "rating": 5, "comment": "Really happy with this one."}'
```

## Leave a review for the same car with the same account (fails)

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 17, "rating": 5, "comment": "review for the same car."}'
```

## Invalid rating

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 2, "rating": 9}'
```

## Get all reviews for a vehicle

```bash
curl http://localhost:5000/api/reviews/vehicle/17
```

# Wishlist

## Add a vehicle to wishlist

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/wishlist \ -H "Content-Type: application/json" \ -d '{"vehicleId": 17}'
```

## Try adding the same vehicle again (should fail)

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/wishlist \ -H "Content-Type: application/json" \ -d '{"vehicleId": 17}'
```

## Get the wishlist

```bash
curl -b cookies.txt http://localhost:5000/api/wishlist
```

## Remove a vehicle from wishlist

```bash
curl -b cookies.txt -X DELETE http://localhost:5000/api/wishlist/17
```

## Try removing something not in the wishlist (should fail)

```bash
curl -b cookies.txt -X DELETE http://localhost:5000/api/wishlist/323
```

## Try without being logged in (should fail)

```bash
curl -X GET http://localhost:5000/api/wishlist
```

# Cart

## Add a vehicle to cart (Must log in first)

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/cart \ -H "Content-Type: application/json" \ -d '{"vehicleId": 4, "quantity": 1}'
```

## Add the same vehicle again (should increase quantity)

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/cart \ -H "Content-Type: application/json" \ -d '{"vehicleId": 4, "quantity": 1}'
```

## Try adding more than available stock

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/cart \ -H "Content-Type: application/json" \ -d '{"vehicleId": 1, "quantity": 9}'
```

## Get the cart

```bash
curl -b cookies.txt http://localhost:5000/api/cart
```

## Update a cart item's quantity

```bash
curl -b cookies.txt -X PATCH http://localhost:5000/api/cart/1 \ -H "Content-Type: application/json" \ -d '{"quantity": 3}'
```

## Remove a cart item

```bash
curl -b cookies.txt -X DELETE http://localhost:5000/api/cart/1
```
