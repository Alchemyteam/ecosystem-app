# 购物车接口后端实现指南

## 概述

本文档详细说明了购物车相关接口的后端实现规范。所有接口都需要用户认证（Bearer Token）。

---

## 接口列表

1. [获取购物车](#1-获取购物车)
2. [添加到购物车](#2-添加到购物车)
3. [更新购物车商品数量](#3-更新购物车商品数量)
4. [删除购物车商品](#4-删除购物车商品)

---

## 1. 获取购物车

### 接口地址
```
GET /api/buyer/cart
```

### 请求头
```
Authorization: Bearer {token}
Content-Type: application/json
```

### 请求参数
无

### 成功响应 (HTTP 200)

```json
{
  "items": [
    {
      "id": "cart_item_789",
      "product": {
        "id": "1234",
        "name": "Steel Formwork System",
        "price": 299.99,
        "image": "https://example.com/image.jpg"
      },
      "quantity": 2,
      "subtotal": 599.98
    },
    {
      "id": "cart_item_790",
      "product": {
        "id": "5678",
        "name": "Concrete Mixer",
        "price": 150.00,
        "image": "https://example.com/image2.jpg"
      },
      "quantity": 1,
      "subtotal": 150.00
    }
  ],
  "total": 749.98,
  "itemCount": 3
}
```

### 响应字段说明

- `items` (array, 必需) - 购物车商品列表
  - `id` (string, 必需) - 购物车项ID（购物车表的主键）
  - `product` (object, 必需) - 商品信息
    - `id` (string, 必需) - 商品ID（对应 sales_data 表的 `id` 字段，数据库主键）
    - `name` (string, 必需) - 商品名称（对应 sales_data 表的 `ItemName` 字段）
    - `price` (number, 必需) - 商品单价（对应 sales_data 表的 `TXP1` 或 `Unit Cost` 字段）
    - `image` (string, 可选) - 商品图片URL（如果有的话）
  - `quantity` (number, 必需) - 商品数量
  - `subtotal` (number, 必需) - 小计（price × quantity）
- `total` (number, 必需) - 购物车总金额（所有商品 subtotal 的总和）
- `itemCount` (number, 必需) - 购物车商品总数量（所有商品 quantity 的总和）

### 错误响应

#### HTTP 401 - 未授权
```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

#### HTTP 500 - 服务器错误
```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### 实现示例

#### Python (Flask)

```python
from flask import jsonify, request
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'message': 'Unauthorized', 'error': 'Invalid or missing token'}), 401
        # 验证 token 并获取用户ID
        user_id = verify_token(token.replace('Bearer ', ''))
        if not user_id:
            return jsonify({'message': 'Unauthorized', 'error': 'Invalid token'}), 401
        return f(user_id, *args, **kwargs)
    return decorated_function

@app.route('/api/buyer/cart', methods=['GET'])
@require_auth
def get_cart(user_id):
    """
    获取当前用户的购物车
    """
    try:
        # 查询购物车表（假设表名为 cart_items）
        # 需要关联 sales_data 表获取商品信息
        query = """
            SELECT 
                ci.id as cart_item_id,
                ci.product_id,
                ci.quantity,
                sd.id as product_id,
                sd.ItemName as product_name,
                COALESCE(sd.TXP1, sd.Unit Cost, 0) as product_price,
                NULL as product_image
            FROM cart_items ci
            INNER JOIN sales_data sd ON ci.product_id = sd.id
            WHERE ci.user_id = %s
            ORDER BY ci.created_at DESC
        """
        
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        
        items = []
        total = 0
        item_count = 0
        
        for row in rows:
            price = float(row['product_price'])
            quantity = int(row['quantity'])
            subtotal = price * quantity
            
            item = {
                'id': str(row['cart_item_id']),
                'product': {
                    'id': str(row['product_id']),
                    'name': row['product_name'] or 'Unknown Product',
                    'price': price,
                    'image': row['product_image']
                },
                'quantity': quantity,
                'subtotal': subtotal
            }
            items.append(item)
            total += subtotal
            item_count += quantity
        
        return jsonify({
            'items': items,
            'total': round(total, 2),
            'itemCount': item_count
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Internal server error',
            'error': str(e)
        }), 500
```

#### Python (FastAPI)

```python
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

router = APIRouter()

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    token = authorization.replace('Bearer ', '')
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

@router.get("/api/buyer/cart")
async def get_cart(user_id: str = Depends(get_current_user)):
    """
    获取当前用户的购物车
    """
    try:
        # 查询购物车
        query = """
            SELECT 
                ci.id as cart_item_id,
                ci.product_id,
                ci.quantity,
                sd.id as product_id,
                sd.ItemName as product_name,
                COALESCE(sd.TXP1, sd.Unit Cost, 0) as product_price,
                NULL as product_image
            FROM cart_items ci
            INNER JOIN sales_data sd ON ci.product_id = sd.id
            WHERE ci.user_id = :user_id
            ORDER BY ci.created_at DESC
        """
        
        result = await database.fetch_all(query, {'user_id': user_id})
        
        items = []
        total = 0
        item_count = 0
        
        for row in result:
            price = float(row['product_price'])
            quantity = int(row['quantity'])
            subtotal = price * quantity
            
            item = {
                'id': str(row['cart_item_id']),
                'product': {
                    'id': str(row['product_id']),
                    'name': row['product_name'] or 'Unknown Product',
                    'price': price,
                    'image': row['product_image']
                },
                'quantity': quantity,
                'subtotal': subtotal
            }
            items.append(item)
            total += subtotal
            item_count += quantity
        
        return {
            'items': items,
            'total': round(total, 2),
            'itemCount': item_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 2. 添加到购物车

### 接口地址
```
POST /api/buyer/cart/add
```

### 请求头
```
Authorization: Bearer {token}
Content-Type: application/json
```

### 请求体

```json
{
  "productId": "1234",
  "quantity": 2
}
```

### 请求字段说明

- `productId` (string, 必需) - 商品ID（对应 sales_data 表的 `id` 字段，数据库主键）
- `quantity` (number, 可选) - 商品数量，默认为 1，最小值为 1

### 成功响应 (HTTP 200)

```json
{
  "message": "Product added to cart",
  "cartItem": {
    "id": "cart_item_789",
    "productId": "1234",
    "quantity": 2,
    "price": 299.99,
    "subtotal": 599.98
  }
}
```

### 响应字段说明

- `message` (string, 必需) - 成功消息
- `cartItem` (object, 必需) - 添加的购物车项
  - `id` (string, 必需) - 购物车项ID
  - `productId` (string, 必需) - 商品ID
  - `quantity` (number, 必需) - 商品数量
  - `price` (number, 必需) - 商品单价
  - `subtotal` (number, 必需) - 小计

### 错误响应

#### HTTP 400 - 请求参数错误
```json
{
  "message": "Invalid request",
  "error": "productId is required"
}
```

```json
{
  "message": "Invalid request",
  "error": "quantity must be greater than 0"
}
```

#### HTTP 404 - 商品不存在
```json
{
  "message": "Product not found",
  "error": "Product with id 1234 does not exist"
}
```

#### HTTP 401 - 未授权
```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

#### HTTP 500 - 服务器错误
```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### 业务逻辑

1. **验证商品是否存在**：根据 `productId` 查询 `sales_data` 表，确保商品存在
2. **检查购物车中是否已有该商品**：
   - 如果已有，则更新数量（新数量 = 原数量 + 请求数量）
   - 如果没有，则创建新的购物车项
3. **计算价格**：从 `sales_data` 表获取商品价格（优先使用 `TXP1`，其次使用 `Unit Cost`）

### 实现示例

#### Python (Flask)

```python
@app.route('/api/buyer/cart/add', methods=['POST'])
@require_auth
def add_to_cart(user_id):
    """
    添加商品到购物车
    """
    try:
        data = request.get_json()
        
        # 验证请求参数
        if not data or 'productId' not in data:
            return jsonify({
                'message': 'Invalid request',
                'error': 'productId is required'
            }), 400
        
        product_id = data.get('productId')
        quantity = data.get('quantity', 1)
        
        # 验证数量
        try:
            quantity = int(quantity)
            if quantity < 1:
                return jsonify({
                    'message': 'Invalid request',
                    'error': 'quantity must be greater than 0'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'message': 'Invalid request',
                'error': 'quantity must be a valid number'
            }), 400
        
        # 验证商品是否存在
        product_query = """
            SELECT id, ItemName, COALESCE(TXP1, Unit Cost, 0) as price
            FROM sales_data
            WHERE id = %s
        """
        cursor.execute(product_query, (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({
                'message': 'Product not found',
                'error': f'Product with id {product_id} does not exist'
            }), 404
        
        price = float(product['price'])
        
        # 检查购物车中是否已有该商品
        check_query = """
            SELECT id, quantity
            FROM cart_items
            WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(check_query, (user_id, product_id))
        existing_item = cursor.fetchone()
        
        if existing_item:
            # 更新数量
            new_quantity = existing_item['quantity'] + quantity
            update_query = """
                UPDATE cart_items
                SET quantity = %s, updated_at = NOW()
                WHERE id = %s
            """
            cursor.execute(update_query, (new_quantity, existing_item['id']))
            cart_item_id = existing_item['id']
            final_quantity = new_quantity
        else:
            # 创建新的购物车项
            insert_query = """
                INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
                VALUES (%s, %s, %s, NOW(), NOW())
            """
            cursor.execute(insert_query, (user_id, product_id, quantity))
            cart_item_id = cursor.lastrowid
            final_quantity = quantity
        
        connection.commit()
        
        subtotal = price * final_quantity
        
        return jsonify({
            'message': 'Product added to cart',
            'cartItem': {
                'id': str(cart_item_id),
                'productId': str(product_id),
                'quantity': final_quantity,
                'price': price,
                'subtotal': round(subtotal, 2)
            }
        }), 200
        
    except Exception as e:
        connection.rollback()
        return jsonify({
            'message': 'Internal server error',
            'error': str(e)
        }), 500
```

#### Python (FastAPI)

```python
from pydantic import BaseModel, Field

class AddToCartRequest(BaseModel):
    productId: str = Field(..., description="Product ID")
    quantity: int = Field(1, ge=1, description="Quantity (minimum 1)")

@router.post("/api/buyer/cart/add")
async def add_to_cart(request: AddToCartRequest, user_id: str = Depends(get_current_user)):
    """
    添加商品到购物车
    """
    try:
        product_id = request.productId
        quantity = request.quantity
        
        # 验证商品是否存在
        product_query = """
            SELECT id, ItemName, COALESCE(TXP1, Unit Cost, 0) as price
            FROM sales_data
            WHERE id = :product_id
        """
        product = await database.fetch_one(product_query, {'product_id': product_id})
        
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f'Product with id {product_id} does not exist'
            )
        
        price = float(product['price'])
        
        # 检查购物车中是否已有该商品
        check_query = """
            SELECT id, quantity
            FROM cart_items
            WHERE user_id = :user_id AND product_id = :product_id
        """
        existing_item = await database.fetch_one(
            check_query,
            {'user_id': user_id, 'product_id': product_id}
        )
        
        if existing_item:
            # 更新数量
            new_quantity = existing_item['quantity'] + quantity
            update_query = """
                UPDATE cart_items
                SET quantity = :quantity, updated_at = NOW()
                WHERE id = :id
            """
            await database.execute(
                update_query,
                {'quantity': new_quantity, 'id': existing_item['id']}
            )
            cart_item_id = existing_item['id']
            final_quantity = new_quantity
        else:
            # 创建新的购物车项
            insert_query = """
                INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
                VALUES (:user_id, :product_id, :quantity, NOW(), NOW())
            """
            cart_item_id = await database.execute(
                insert_query,
                {'user_id': user_id, 'product_id': product_id, 'quantity': quantity}
            )
            final_quantity = quantity
        
        subtotal = price * final_quantity
        
        return {
            'message': 'Product added to cart',
            'cartItem': {
                'id': str(cart_item_id),
                'productId': str(product_id),
                'quantity': final_quantity,
                'price': price,
                'subtotal': round(subtotal, 2)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 3. 更新购物车商品数量

### 接口地址
```
PUT /api/buyer/cart/:cartItemId
```

### 请求头
```
Authorization: Bearer {token}
Content-Type: application/json
```

### 路径参数

- `cartItemId` (string, 必需) - 购物车项ID（购物车表的主键）

### 请求体

```json
{
  "quantity": 3
}
```

### 请求字段说明

- `quantity` (number, 必需) - 新的商品数量，最小值为 1

### 成功响应 (HTTP 200)

```json
{
  "id": "cart_item_789",
  "product": {
    "id": "1234",
    "name": "Steel Formwork System",
    "price": 299.99,
    "image": "https://example.com/image.jpg"
  },
  "quantity": 3,
  "subtotal": 899.97
}
```

### 响应字段说明

- `id` (string, 必需) - 购物车项ID
- `product` (object, 必需) - 商品信息（同获取购物车接口）
- `quantity` (number, 必需) - 更新后的商品数量
- `subtotal` (number, 必需) - 小计

### 错误响应

#### HTTP 400 - 请求参数错误
```json
{
  "message": "Invalid request",
  "error": "quantity must be greater than 0"
}
```

#### HTTP 404 - 购物车项不存在
```json
{
  "message": "Cart item not found",
  "error": "Cart item with id cart_item_789 does not exist"
}
```

#### HTTP 403 - 无权限
```json
{
  "message": "Forbidden",
  "error": "You do not have permission to modify this cart item"
}
```

#### HTTP 401 - 未授权
```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

#### HTTP 500 - 服务器错误
```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### 业务逻辑

1. **验证购物车项是否存在**：根据 `cartItemId` 查询购物车表
2. **验证权限**：确保该购物车项属于当前用户
3. **验证数量**：确保新数量大于 0
4. **更新数量**：更新购物车项的数量
5. **重新计算小计**：根据新的数量和商品价格计算小计

### 实现示例

#### Python (Flask)

```python
@app.route('/api/buyer/cart/<cart_item_id>', methods=['PUT'])
@require_auth
def update_cart_item(user_id, cart_item_id):
    """
    更新购物车商品数量
    """
    try:
        data = request.get_json()
        
        # 验证请求参数
        if not data or 'quantity' not in data:
            return jsonify({
                'message': 'Invalid request',
                'error': 'quantity is required'
            }), 400
        
        quantity = data.get('quantity')
        
        # 验证数量
        try:
            quantity = int(quantity)
            if quantity < 1:
                return jsonify({
                    'message': 'Invalid request',
                    'error': 'quantity must be greater than 0'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'message': 'Invalid request',
                'error': 'quantity must be a valid number'
            }), 400
        
        # 验证购物车项是否存在且属于当前用户
        check_query = """
            SELECT ci.id, ci.product_id, ci.quantity,
                   sd.ItemName, COALESCE(sd.TXP1, sd.Unit Cost, 0) as price
            FROM cart_items ci
            INNER JOIN sales_data sd ON ci.product_id = sd.id
            WHERE ci.id = %s AND ci.user_id = %s
        """
        cursor.execute(check_query, (cart_item_id, user_id))
        cart_item = cursor.fetchone()
        
        if not cart_item:
            return jsonify({
                'message': 'Cart item not found',
                'error': f'Cart item with id {cart_item_id} does not exist'
            }), 404
        
        # 更新数量
        update_query = """
            UPDATE cart_items
            SET quantity = %s, updated_at = NOW()
            WHERE id = %s
        """
        cursor.execute(update_query, (quantity, cart_item_id))
        connection.commit()
        
        price = float(cart_item['price'])
        subtotal = price * quantity
        
        return jsonify({
            'id': str(cart_item_id),
            'product': {
                'id': str(cart_item['product_id']),
                'name': cart_item['ItemName'] or 'Unknown Product',
                'price': price,
                'image': None
            },
            'quantity': quantity,
            'subtotal': round(subtotal, 2)
        }), 200
        
    except Exception as e:
        connection.rollback()
        return jsonify({
            'message': 'Internal server error',
            'error': str(e)
        }), 500
```

#### Python (FastAPI)

```python
class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1, description="Quantity (minimum 1)")

@router.put("/api/buyer/cart/{cart_item_id}")
async def update_cart_item(
    cart_item_id: str,
    request: UpdateCartItemRequest,
    user_id: str = Depends(get_current_user)
):
    """
    更新购物车商品数量
    """
    try:
        quantity = request.quantity
        
        # 验证购物车项是否存在且属于当前用户
        check_query = """
            SELECT ci.id, ci.product_id, ci.quantity,
                   sd.ItemName, COALESCE(sd.TXP1, sd.Unit Cost, 0) as price
            FROM cart_items ci
            INNER JOIN sales_data sd ON ci.product_id = sd.id
            WHERE ci.id = :cart_item_id AND ci.user_id = :user_id
        """
        cart_item = await database.fetch_one(
            check_query,
            {'cart_item_id': cart_item_id, 'user_id': user_id}
        )
        
        if not cart_item:
            raise HTTPException(
                status_code=404,
                detail=f'Cart item with id {cart_item_id} does not exist'
            )
        
        # 更新数量
        update_query = """
            UPDATE cart_items
            SET quantity = :quantity, updated_at = NOW()
            WHERE id = :cart_item_id
        """
        await database.execute(
            update_query,
            {'quantity': quantity, 'cart_item_id': cart_item_id}
        )
        
        price = float(cart_item['price'])
        subtotal = price * quantity
        
        return {
            'id': str(cart_item_id),
            'product': {
                'id': str(cart_item['product_id']),
                'name': cart_item['ItemName'] or 'Unknown Product',
                'price': price,
                'image': None
            },
            'quantity': quantity,
            'subtotal': round(subtotal, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 4. 删除购物车商品

### 接口地址
```
DELETE /api/buyer/cart/:cartItemId
```

### 请求头
```
Authorization: Bearer {token}
Content-Type: application/json
```

### 路径参数

- `cartItemId` (string, 必需) - 购物车项ID（购物车表的主键）

### 请求体
无

### 成功响应 (HTTP 200)

```json
{
  "message": "Cart item removed successfully"
}
```

### 错误响应

#### HTTP 404 - 购物车项不存在
```json
{
  "message": "Cart item not found",
  "error": "Cart item with id cart_item_789 does not exist"
}
```

#### HTTP 403 - 无权限
```json
{
  "message": "Forbidden",
  "error": "You do not have permission to delete this cart item"
}
```

#### HTTP 401 - 未授权
```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

#### HTTP 500 - 服务器错误
```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### 业务逻辑

1. **验证购物车项是否存在**：根据 `cartItemId` 查询购物车表
2. **验证权限**：确保该购物车项属于当前用户
3. **删除购物车项**：从购物车表中删除该记录

### 实现示例

#### Python (Flask)

```python
@app.route('/api/buyer/cart/<cart_item_id>', methods=['DELETE'])
@require_auth
def remove_from_cart(user_id, cart_item_id):
    """
    从购物车中删除商品
    """
    try:
        # 验证购物车项是否存在且属于当前用户
        check_query = """
            SELECT id
            FROM cart_items
            WHERE id = %s AND user_id = %s
        """
        cursor.execute(check_query, (cart_item_id, user_id))
        cart_item = cursor.fetchone()
        
        if not cart_item:
            return jsonify({
                'message': 'Cart item not found',
                'error': f'Cart item with id {cart_item_id} does not exist'
            }), 404
        
        # 删除购物车项
        delete_query = """
            DELETE FROM cart_items
            WHERE id = %s
        """
        cursor.execute(delete_query, (cart_item_id,))
        connection.commit()
        
        return jsonify({
            'message': 'Cart item removed successfully'
        }), 200
        
    except Exception as e:
        connection.rollback()
        return jsonify({
            'message': 'Internal server error',
            'error': str(e)
        }), 500
```

#### Python (FastAPI)

```python
@router.delete("/api/buyer/cart/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    从购物车中删除商品
    """
    try:
        # 验证购物车项是否存在且属于当前用户
        check_query = """
            SELECT id
            FROM cart_items
            WHERE id = :cart_item_id AND user_id = :user_id
        """
        cart_item = await database.fetch_one(
            check_query,
            {'cart_item_id': cart_item_id, 'user_id': user_id}
        )
        
        if not cart_item:
            raise HTTPException(
                status_code=404,
                detail=f'Cart item with id {cart_item_id} does not exist'
            )
        
        # 删除购物车项
        delete_query = """
            DELETE FROM cart_items
            WHERE id = :cart_item_id
        """
        await database.execute(
            delete_query,
            {'cart_item_id': cart_item_id}
        )
        
        return {
            'message': 'Cart item removed successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 数据库表结构

### 购物车表 (cart_items)

建议的数据库表结构：

```sql
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- 或使用 UUID
    user_id VARCHAR(255) NOT NULL,       -- 用户ID（从 token 中获取）
    product_id VARCHAR(255) NOT NULL,   -- 商品ID（对应 sales_data 表的 id 字段）
    quantity INT NOT NULL DEFAULT 1,     -- 商品数量
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES sales_data(id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY unique_user_product (user_id, product_id)  -- 可选：确保同一用户同一商品只有一条记录
);
```

**注意**：
- `product_id` 应该对应 `sales_data` 表的 `id` 字段（数据库主键）
- 如果使用 `UNIQUE KEY unique_user_product`，则在添加商品时，如果已存在，应该更新数量而不是创建新记录
- 如果不使用 `UNIQUE KEY`，则同一用户同一商品可以有多条记录（前端会合并显示）

---

## 重要注意事项

### 1. 产品ID格式

- **必须使用数据库主键 `id`**：`productId` 应该是 `sales_data` 表的 `id` 字段（数字类型）
- **不要使用 `TXNo` 或 `ItemCode`**：虽然这些字段也可以唯一标识产品，但为了保持一致性和性能，统一使用数据库主键 `id`

### 2. 价格获取逻辑

商品价格应该从 `sales_data` 表中获取，优先级如下：
1. `TXP1`（交易价格1）
2. `Unit Cost`（单位成本）
3. 如果都为空，使用 `0`

### 3. 商品名称

商品名称应该从 `sales_data` 表的 `ItemName` 字段获取。

### 4. 认证

所有接口都需要：
- 在请求头中携带 `Authorization: Bearer {token}`
- 验证 token 的有效性
- 从 token 中提取用户ID（`user_id`）

### 5. 错误处理

- 所有错误都应该返回明确的错误消息
- HTTP 状态码应该准确反映错误类型：
  - `400` - 请求参数错误
  - `401` - 未授权
  - `403` - 无权限
  - `404` - 资源不存在
  - `500` - 服务器错误

### 6. 数据一致性

- 确保购物车中的商品ID在 `sales_data` 表中存在
- 如果商品被删除，购物车中的相关记录也应该被处理（可以选择删除或标记为无效）

---

## 测试建议

### 1. 单元测试

- 测试添加商品到购物车
- 测试更新购物车商品数量
- 测试删除购物车商品
- 测试获取购物车列表
- 测试边界情况（数量为0、负数、商品不存在等）

### 2. 集成测试

- 测试完整的购物车流程
- 测试并发操作（同一用户同时添加多个商品）
- 测试权限验证（用户只能操作自己的购物车）

### 3. 性能测试

- 测试大量商品时的查询性能
- 测试购物车表的索引是否有效

---

## 前端调用示例

### 获取购物车
```typescript
const cartData = await buyerApi.getCart();
console.log(cartData.items); // 购物车商品列表
console.log(cartData.total); // 总金额
console.log(cartData.itemCount); // 商品总数量
```

### 添加到购物车
```typescript
const response = await buyerApi.addToCart({
  productId: "1234",
  quantity: 2
});
console.log(response.message); // "Product added to cart"
console.log(response.cartItem); // 添加的购物车项
```

### 更新购物车商品数量
```typescript
const updatedItem = await buyerApi.updateCartItem("cart_item_789", 3);
console.log(updatedItem.quantity); // 3
console.log(updatedItem.subtotal); // 小计
```

### 删除购物车商品
```typescript
const response = await buyerApi.removeFromCart("cart_item_789");
console.log(response.message); // "Cart item removed successfully"
```

---

## 总结

本文档详细说明了购物车相关接口的后端实现规范。所有接口都需要：

1. ✅ 用户认证（Bearer Token）
2. ✅ 使用 `sales_data` 表的 `id` 字段作为商品ID
3. ✅ 关联查询获取商品信息（名称、价格等）
4. ✅ 正确的错误处理和HTTP状态码
5. ✅ 数据验证和权限检查

如有任何问题，请参考前端代码实现或联系前端开发团队。

