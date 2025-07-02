
# API Documentation

## Authentication

### Sign Up
```typescript
POST /auth/sign-up
{
  email: string
  password: string
  firstName: string
  lastName: string
  mobile: string
  address: string
}
```

### Sign In
```typescript
POST /auth/sign-in
{
  email: string
  password: string
}
```

## Products

### Get Products
```typescript
GET /products
```

### Get Product
```typescript
GET /products/:id
```

## Orders

### Create Order
```typescript
POST /orders
{
  items: Array<{
    id: string
    quantity: number
  }>
  shipping_address: string
  mobile_number: string
}
```

### Get Orders
```typescript
GET /orders
```

### Update Order Status
```typescript
PATCH /orders/:id
{
  status: 'pending' | 'approved' | 'shipped' | 'delivered'
  delivery_date?: string
}
```

## Cart

### Get Cart
```typescript
GET /cart
```

### Update Cart
```typescript
POST /cart
{
  items: Array<{
    id: string
    quantity: number
  }>
}
```

## Admin

### Get Admin Dashboard
```typescript
GET /admin/dashboard
```

### Update Product
```typescript
PATCH /admin/products/:id
{
  name?: string
  description?: string
  price?: number
  stock_quantity?: number
  image_url?: string
}
```
