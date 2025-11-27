# Buyer Portal API 接口规范

## 基础信息
- **基础URL**: `http://localhost:8000/api` (可通过环境变量配置)
- **Content-Type**: `application/json`
- **认证方式**: `Authorization: Bearer {token}` (所有接口都需要认证)

---

## 接口列表

### 1. 搜索产品

**接口地址**: `GET /api/buyer/products/search`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**查询参数**:
```
?keyword=formwork&category=steel&minPrice=100&maxPrice=1000&page=1&limit=20
```

**参数说明**:
- `keyword` (string, 可选) - 搜索关键词
- `category` (string, 可选) - 产品分类
- `minPrice` (number, 可选) - 最低价格
- `maxPrice` (number, 可选) - 最高价格
- `page` (number, 可选) - 页码，默认1
- `limit` (number, 可选) - 每页数量，默认20

**成功响应** (HTTP 200):
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Steel Formwork System",
      "description": "High-quality steel formwork system for construction",
      "price": 299.99,
      "currency": "USD",
      "image": "https://example.com/image.jpg",
      "seller": {
        "id": "seller_456",
        "name": "ABC Construction Supplies",
        "verified": true
      },
      "certification": {
        "peCertified": true,
        "certificateNumber": "CERT-001",
        "certifiedBy": "PE-123"
      },
      "stock": 50,
      "rating": 4.5,
      "reviewsCount": 23
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### 2. 获取特色产品

**接口地址**: `GET /api/buyer/products/featured`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**查询参数**:
```
?limit=3
```

**参数说明**:
- `limit` (number, 可选) - 返回数量，默认3

**成功响应** (HTTP 200):
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Product 1",
      "description": "Product description goes here",
      "price": 99.99,
      "currency": "USD",
      "image": "https://example.com/image.jpg",
      "seller": {
        "id": "seller_456",
        "name": "Seller Name",
        "verified": true
      },
      "certification": {
        "peCertified": true,
        "certificateNumber": "CERT-001"
      },
      "stock": 50,
      "rating": 4.5
    }
  ]
}
```

---

### 3. 获取所有产品（浏览目录）

**接口地址**: `GET /api/buyer/products`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**查询参数**:
```
?page=1&limit=20&sort=price_asc&category=all
```

**参数说明**:
- `page` (number, 可选) - 页码，默认1
- `limit` (number, 可选) - 每页数量，默认20
- `sort` (string, 可选) - 排序方式：`price_asc`, `price_desc`, `rating_desc`, `newest`
- `category` (string, 可选) - 产品分类

**成功响应** (HTTP 200):
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

### 4. 获取产品详情

**接口地址**: `GET /api/buyer/products/:productId`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**成功响应** (HTTP 200):
```json
{
  "id": "prod_123",
  "name": "Steel Formwork System",
  "description": "Detailed product description",
  "price": 299.99,
  "currency": "USD",
  "images": ["url1", "url2"],
  "seller": {
    "id": "seller_456",
    "name": "ABC Construction Supplies",
    "verified": true,
    "rating": 4.8
  },
  "certification": {
    "peCertified": true,
    "certificateNumber": "CERT-001",
    "certifiedBy": "PE-123",
    "certifiedDate": "2024-01-15"
  },
  "specifications": {
    "material": "Steel",
    "dimensions": "2m x 1m",
    "weight": "50kg"
  },
  "stock": 50,
  "rating": 4.5,
  "reviewsCount": 23,
  "inWishlist": false
}
```

---

### 5. 添加到购物车

**接口地址**: `POST /api/buyer/cart/add`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "productId": "prod_123",
  "quantity": 2
}
```

**成功响应** (HTTP 200):
```json
{
  "message": "Product added to cart",
  "cartItem": {
    "id": "cart_item_789",
    "productId": "prod_123",
    "quantity": 2,
    "price": 299.99,
    "subtotal": 599.98
  }
}
```

---

### 6. 获取购物车

**接口地址**: `GET /api/buyer/cart`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**成功响应** (HTTP 200):
```json
{
  "items": [
    {
      "id": "cart_item_789",
      "product": {
        "id": "prod_123",
        "name": "Steel Formwork System",
        "price": 299.99,
        "image": "url"
      },
      "quantity": 2,
      "subtotal": 599.98
    }
  ],
  "total": 599.98,
  "itemCount": 2
}
```

---

### 7. 创建订单

**接口地址**: `POST /api/buyer/orders`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Singapore",
    "postalCode": "123456",
    "country": "Singapore"
  },
  "paymentMethod": "credit_card"
}
```

**成功响应** (HTTP 201):
```json
{
  "order": {
    "id": "order_456",
    "orderNumber": "ORD-2024-001",
    "status": "pending",
    "items": [
      {
        "productId": "prod_123",
        "productName": "Steel Formwork System",
        "quantity": 2,
        "price": 299.99,
        "subtotal": 599.98
      }
    ],
    "total": 599.98,
    "currency": "USD",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### 8. 获取订单列表

**接口地址**: `GET /api/buyer/orders`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**查询参数**:
```
?status=all&page=1&limit=20
```

**参数说明**:
- `status` (string, 可选) - 订单状态：`all`, `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- `page` (number, 可选) - 页码
- `limit` (number, 可选) - 每页数量

**成功响应** (HTTP 200):
```json
{
  "orders": [
    {
      "id": "order_456",
      "orderNumber": "ORD-2024-001",
      "status": "shipped",
      "total": 599.98,
      "currency": "USD",
      "itemCount": 2,
      "createdAt": "2024-01-20T10:30:00Z",
      "estimatedDelivery": "2024-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "totalPages": 2
  }
}
```

---

### 9. 获取订单详情

**接口地址**: `GET /api/buyer/orders/:orderId`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**成功响应** (HTTP 200):
```json
{
  "id": "order_456",
  "orderNumber": "ORD-2024-001",
  "status": "shipped",
  "items": [
    {
      "productId": "prod_123",
      "productName": "Steel Formwork System",
      "quantity": 2,
      "price": 299.99,
      "subtotal": 599.98,
      "image": "url"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Singapore",
    "postalCode": "123456",
    "country": "Singapore"
  },
  "subtotal": 599.98,
  "shipping": 50.00,
  "tax": 45.00,
  "total": 694.98,
  "currency": "USD",
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-22T10:30:00Z",
  "trackingNumber": "TRACK-123456"
}
```

---

### 10. 添加到愿望清单

**接口地址**: `POST /api/buyer/wishlist/add`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "productId": "prod_123"
}
```

**成功响应** (HTTP 200):
```json
{
  "message": "Product added to wishlist",
  "wishlistItem": {
    "id": "wish_789",
    "productId": "prod_123",
    "addedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### 11. 获取愿望清单

**接口地址**: `GET /api/buyer/wishlist`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**查询参数**:
```
?page=1&limit=20
```

**成功响应** (HTTP 200):
```json
{
  "items": [
    {
      "id": "wish_789",
      "product": {
        "id": "prod_123",
        "name": "Steel Formwork System",
        "description": "Product description",
        "price": 299.99,
        "currency": "USD",
        "image": "url",
        "stock": 50
      },
      "addedAt": "2024-01-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

### 12. 从愿望清单移除

**接口地址**: `DELETE /api/buyer/wishlist/:wishlistItemId`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**成功响应** (HTTP 200):
```json
{
  "message": "Product removed from wishlist"
}
```

---

### 13. 获取买家统计数据

**接口地址**: `GET /api/buyer/statistics`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**查询参数**:
```
?period=month
```

**参数说明**:
- `period` (string, 可选) - 统计周期：`week`, `month`, `year`，默认`month`

**成功响应** (HTTP 200):
```json
{
  "totalOrders": 24,
  "activeOrders": 5,
  "wishlistItems": 12,
  "totalSpent": 12500.50,
  "currency": "USD",
  "period": "month",
  "orderStatusBreakdown": {
    "pending": 2,
    "processing": 1,
    "shipped": 2,
    "delivered": 19,
    "cancelled": 0
  }
}
```

---

## 错误响应格式

所有错误都应该返回：
```json
{
  "message": "错误信息",
  "errors": {
    "field_name": ["错误1", "错误2"]
  }
}
```

### HTTP 状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权（token无效）
- `404` - 资源不存在
- `500` - 服务器错误

---

## 数据模型

### Product（产品）
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  images?: string[];
  seller: {
    id: string;
    name: string;
    verified: boolean;
    rating?: number;
  };
  certification?: {
    peCertified: boolean;
    certificateNumber?: string;
    certifiedBy?: string;
    certifiedDate?: string;
  };
  specifications?: Record<string, any>;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Order（订单）
```typescript
{
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    image?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}
```

### WishlistItem（愿望清单项）
```typescript
{
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}
```

---

## 接口调用示例

### 搜索产品
```http
GET /api/buyer/products/search?keyword=formwork&page=1&limit=20
Authorization: Bearer {token}
```

### 添加到购物车
```http
POST /api/buyer/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_123",
  "quantity": 2
}
```

### 获取订单列表
```http
GET /api/buyer/orders?status=all&page=1&limit=20
Authorization: Bearer {token}
```

---

## 注意事项

1. **认证**: 所有接口都需要在Header中携带有效的token
2. **分页**: 列表接口都支持分页，使用`page`和`limit`参数
3. **排序**: 产品列表支持多种排序方式
4. **过滤**: 产品搜索支持多条件过滤
5. **错误处理**: 前端会显示后端返回的`message`或`errors`中的错误信息

