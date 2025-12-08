# 产品详情接口后端实现指南

## 接口规范

### 接口地址
```
GET /api/buyer/products/:productId
```

### 请求头
```
Authorization: Bearer {token}
Content-Type: application/json
```

### 路径参数
- `productId` (string, 必需) - 产品ID，支持以下格式（按优先级）：
  1. **数字格式**（推荐）：数据库主键 `id`，如 `1234`、`5678`
  2. **ItemCode 格式**（向后兼容）：产品代码，如 `TI00040`
  
  **重要说明**：
  - ✅ **推荐使用数字格式**：使用数据库主键 `id`，这是唯一的主键标识符
  - ✅ **支持 ItemCode**：如果传入的是 ItemCode，系统会查找该 ItemCode 的第一条记录
  - ✅ **接受纯数字**：数字格式是有效的产品ID（数据库主键）
  
  **查询优先级**：
  1. 首先尝试通过数字 `id`（主键）查询
  2. 如果找不到，尝试通过 `ItemCode` 查询

---

## 返回数据结构

接口需要返回 `BuyerProduct` 格式的数据：

```typescript
{
  id: string;                    // 产品ID（使用ItemCode或实际产品ID）
  name: string;                  // 产品名称（ItemName）
  description?: string;          // 产品描述（可选）
  price: number;                 // 价格（TXP1或最新价格）
  currency: string;              // 货币单位（默认"USD"）
  image?: string;                // 主图片URL（可选）
  images?: string[];             // 多图片URL数组（可选）
  seller?: {                     // 卖家信息（可选）
    id: string;
    name: string;
    verified?: boolean;
    rating?: number;
  };
  certification?: {               // 认证信息（可选）
    peCertified: boolean;
    certificateNumber?: string;
    certifiedBy?: string;
    certifiedDate?: string;
  };
  stock?: number;                // 库存数量（可选）
  rating?: number;               // 评分（可选）
  reviewsCount?: number;         // 评论数量（可选）
  category?: string;             // 分类（Product Hierarchy 3）
  tags?: string[];               // 标签数组（可选）
  createdAt?: string;            // 创建时间（可选）
  updatedAt?: string;            // 更新时间（可选）
  historicalLowPrice?: number;   // 历史最低价（可选）
  lastTransactionPrice?: number; // 最近交易价（可选）
}
```

---

## 实现方案

### 方案1：基于 sales_data 表查询（推荐）

如果你的产品数据存储在 `sales_data` 表中，可以这样实现：

```python
# Python (Flask/FastAPI) 示例
from flask import jsonify, request
from datetime import datetime

def is_valid_product_id(product_id: str) -> bool:
    """验证产品ID格式"""
    if not product_id or not isinstance(product_id, str):
        return False
    # 接受纯数字（数据库主键 id）
    # 接受包含字母和数字的字符串（如 ItemCode）
    return len(product_id.strip()) > 0

@app.route('/api/buyer/products/<product_id>', methods=['GET'])
@require_auth  # 需要认证中间件
def get_product_detail(product_id):
    """
    获取产品详情
    product_id 必须是 TXNo 或 ItemCode（不能是纯数字）
    """
    try:
        # 1. 验证产品ID格式
        if not is_valid_product_id(product_id):
            return jsonify({
                "message": "Product ID cannot be empty"
            }), 400
        
        # 2. 首先尝试通过数字 id（主键）查询
        product_row = None
        actual_product_id = product_id
        
        # 检查是否是数字格式（数据库主键）
        if product_id.strip().isdigit():
            id_query = """
                SELECT 
                    id,
                    TXNo,
                    ItemCode,
                    ItemName,
                    ItemType,
                    Model,
                    Material,
                    "Product Hierarchy 3" as category,
                    Sector,
                    "Brand Code" as brand_code,
                    UOM,
                    Function,
                    Performance,
                    "Performance.1" as performance1
                FROM sales_data
                WHERE id = %s
                LIMIT 1
            """
            product_row = db.execute(id_query, (int(product_id),)).fetchone()
        
        # 3. 如果通过 id 找不到，尝试通过 ItemCode 查询
        if not product_row:
            itemcode_query = """
                SELECT 
                    id,
                    TXNo,
                    ItemCode,
                    ItemName,
                    ItemType,
                    Model,
                    Material,
                    "Product Hierarchy 3" as category,
                    Sector,
                    "Brand Code" as brand_code,
                    UOM,
                    Function,
                    Performance,
                    "Performance.1" as performance1
                FROM sales_data
                WHERE ItemCode = %s
                LIMIT 1
            """
            product_row = db.execute(itemcode_query, (product_id,)).fetchone()
        
        if not product_row:
            return jsonify({
                "message": f"Product not found with ID: {product_id}. Please use a valid product ID (number) or item code."
            }), 404
        
        # 使用找到的产品标识符（优先使用 id，其次使用 ItemCode）
        actual_product_id = str(product_row.id) if hasattr(product_row, 'id') and product_row.id else (product_row.ItemCode or product_id)
        
        # 4. 查询价格信息（最新价格、历史最低价、最近交易价）
        # 使用 ItemCode 查询价格（因为同一产品可能有多个交易记录）
        item_code = product_row.ItemCode
        if item_code:
            price_query = """
                SELECT 
                    TXP1 as price,
                    TXDate as transaction_date
                FROM sales_data
                WHERE ItemCode = %s
                ORDER BY TXDate DESC
                LIMIT 1
            """
            price_row = db.execute(price_query, (item_code,)).fetchone()
            
            # 查询历史最低价
            min_price_query = """
                SELECT MIN(TXP1) as min_price
                FROM sales_data
                WHERE ItemCode = %s AND TXP1 IS NOT NULL
            """
            min_price_row = db.execute(min_price_query, (item_code,)).fetchone()
        else:
            # 如果没有 ItemCode，使用当前记录的价格
            price_row = type('obj', (object,), {
                'price': product_row.TXP1 if hasattr(product_row, 'TXP1') else None,
                'transaction_date': None
            })()
            min_price_row = None
        
        # 3. 查询库存信息（如果有库存表）
        # stock_query = "SELECT stock FROM product_stock WHERE item_code = %s"
        # stock_row = db.execute(stock_query, (product_id,)).fetchone()
        
        # 4. 查询卖家信息（如果有卖家表）
        # seller_query = """
        #     SELECT DISTINCT BuyerCode, BuyerName
        #     FROM sales_data
        #     WHERE ItemCode = %s
        #     LIMIT 1
        # """
        # seller_row = db.execute(seller_query, (product_id,)).fetchone()
        
        # 5. 构建返回数据
        product_data = {
            "id": actual_product_id,  # 使用 TXNo 或 ItemCode
            "name": product_row.ItemName or "Unknown Product",
            "description": f"{product_row.ItemType or ''} - {product_row.Model or ''} - {product_row.Material or ''}".strip(' - '),
            "price": float(price_row.price) if price_row and price_row.price else 0.0,
            "currency": "USD",
            "category": product_row.category,
            "tags": [
                tag for tag in [
                    product_row.ItemType,
                    product_row.brand_code,
                    product_row.Sector,
                    product_row.Function
                ] if tag
            ],
            "historicalLowPrice": float(min_price_row.min_price) if min_price_row and min_price_row.min_price else None,
            "lastTransactionPrice": float(price_row.price) if price_row and price_row.price else None,
            "createdAt": datetime.now().isoformat() if product_row else None,
            "updatedAt": datetime.now().isoformat() if product_row else None,
        }
        
        # 添加可选字段
        if price_row and price_row.price:
            product_data["price"] = float(price_row.price)
        
        # 如果有卖家信息
        # if seller_row:
        #     product_data["seller"] = {
        #         "id": seller_row.BuyerCode,
        #         "name": seller_row.BuyerName,
        #         "verified": False
        #     }
        
        # 如果有库存信息
        # if stock_row:
        #     product_data["stock"] = stock_row.stock
        
        return jsonify(product_data), 200
        
    except Exception as e:
        return jsonify({
            "message": f"Error fetching product: {str(e)}"
        }), 500
```

### 方案2：基于独立产品表查询

如果你有独立的产品表（products表），可以这样实现：

```python
@app.route('/api/buyer/products/<product_id>', methods=['GET'])
@require_auth
def get_product_detail(product_id):
    """
    从products表获取产品详情
    """
    try:
        # 首先尝试用product_id直接查询
        product = db.session.query(Product).filter(
            (Product.id == product_id) | (Product.item_code == product_id)
        ).first()
        
        if not product:
            return jsonify({
                "message": "Product not found"
            }), 404
        
        # 查询历史价格信息
        historical_prices = db.session.query(
            SalesData.TXP1,
            func.min(SalesData.TXP1).label('min_price'),
            func.max(SalesData.TXP1).label('max_price')
        ).filter(
            SalesData.ItemCode == product.item_code
        ).first()
        
        # 构建返回数据
        product_data = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.price) if product.price else 0.0,
            "currency": product.currency or "USD",
            "image": product.image,
            "images": product.images or [],
            "category": product.category,
            "stock": product.stock,
            "rating": product.rating,
            "reviewsCount": product.reviews_count,
            "tags": product.tags or [],
            "createdAt": product.created_at.isoformat() if product.created_at else None,
            "updatedAt": product.updated_at.isoformat() if product.updated_at else None,
        }
        
        # 添加历史价格信息
        if historical_prices:
            product_data["historicalLowPrice"] = float(historical_prices.min_price) if historical_prices.min_price else None
            product_data["lastTransactionPrice"] = float(historical_prices.max_price) if historical_prices.max_price else None
        
        # 添加卖家信息
        if product.seller:
            product_data["seller"] = {
                "id": product.seller.id,
                "name": product.seller.name,
                "verified": product.seller.verified,
                "rating": product.seller.rating
            }
        
        # 添加认证信息
        if product.certification:
            product_data["certification"] = {
                "peCertified": product.certification.pe_certified,
                "certificateNumber": product.certification.certificate_number,
                "certifiedBy": product.certification.certified_by,
                "certifiedDate": product.certification.certified_date.isoformat() if product.certification.certified_date else None
            }
        
        return jsonify(product_data), 200
        
    except Exception as e:
        return jsonify({
            "message": f"Error fetching product: {str(e)}"
        }), 500
```

---

## 完整实现示例（FastAPI）

```python
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

router = APIRouter()

# 依赖注入：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 依赖注入：验证token
def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    # 验证token逻辑
    # user = verify_jwt_token(token)
    # if not user:
    #     raise HTTPException(status_code=401, detail="Invalid token")
    return token

def is_valid_product_id(product_id: str) -> bool:
    """验证产品ID格式"""
    if not product_id or not isinstance(product_id, str):
        return False
    # 接受纯数字（数据库主键 id）
    # 接受包含字母和数字的字符串（如 ItemCode）
    return len(product_id.strip()) > 0

@router.get("/buyer/products/{product_id}")
async def get_product_detail(
    product_id: str,
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    """
    获取产品详情
    
    Args:
        product_id: 产品ID（必须是 TXNo 或 ItemCode，不能是纯数字）
        db: 数据库会话
        token: 认证token
    
    Returns:
        BuyerProduct格式的产品详情
    """
    try:
        # 1. 验证产品ID格式
        if not is_valid_product_id(product_id):
            raise HTTPException(
                status_code=400,
                detail="Product ID cannot be empty"
            )
        
        # 2. 首先尝试通过数字 id（主键）查询
        product = None
        actual_product_id = product_id
        
        # 检查是否是数字格式（数据库主键）
        if product_id.strip().isdigit():
            product = db.query(SalesData).filter(
                SalesData.id == int(product_id)
            ).first()
        
        # 3. 如果通过 id 找不到，尝试通过 ItemCode 查询
        if not product:
            product = db.query(SalesData).filter(
                SalesData.ItemCode == product_id
            ).first()
        
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found with ID: {product_id}. Please use a valid product ID (number) or item code."
            )
        
        # 使用找到的产品标识符（优先使用 id，其次使用 ItemCode）
        actual_product_id = str(product.id) if product.id else (product.ItemCode or product_id)
        
        # 查询价格统计信息（使用 ItemCode）
        item_code = product.ItemCode
        price_stats = None
        latest_transaction = None
        
        if item_code:
            price_stats = db.query(
                func.min(SalesData.TXP1).label('min_price'),
                func.max(SalesData.TXP1).label('max_price'),
                func.avg(SalesData.TXP1).label('avg_price')
            ).filter(
                SalesData.ItemCode == item_code
            ).first()
            
            # 查询最新交易价格
            latest_transaction = db.query(SalesData).filter(
                SalesData.ItemCode == item_code
            ).order_by(SalesData.TXDate.desc()).first()
        else:
            # 如果没有 ItemCode，使用当前记录的价格
            latest_transaction = product
        
        # 构建返回数据
        response_data = {
            "id": actual_product_id,  # 使用 TXNo 或 ItemCode
            "name": product.ItemName or "Unknown Product",
            "description": build_description(product),
            "price": float(latest_transaction.TXP1) if latest_transaction and latest_transaction.TXP1 else 0.0,
            "currency": "USD",
            "category": getattr(product, "Product Hierarchy 3", None),
            "tags": build_tags(product),
            "historicalLowPrice": float(price_stats.min_price) if price_stats and price_stats.min_price else None,
            "lastTransactionPrice": float(latest_transaction.TXP1) if latest_transaction and latest_transaction.TXP1 else None,
        }
        
        # 添加可选字段
        if product.BuyerName:
            response_data["seller"] = {
                "id": product.BuyerCode or "unknown",
                "name": product.BuyerName,
                "verified": False
            }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def build_description(product) -> str:
    """构建产品描述"""
    parts = []
    if product.ItemType:
        parts.append(product.ItemType)
    if product.Model:
        parts.append(product.Model)
    if product.Material:
        parts.append(product.Material)
    return " - ".join(parts) if parts else None

def build_tags(product) -> list:
    """构建标签数组"""
    tags = []
    if product.ItemType:
        tags.append(product.ItemType)
    if product.get("Brand Code"):
        tags.append(product.get("Brand Code"))
    if product.Sector:
        tags.append(product.Sector)
    if product.Function:
        tags.append(product.Function)
    return tags
```

---

## 错误处理

### 400 - 无效的产品ID格式
当产品ID为空或格式无效时，应返回：
```json
{
  "message": "Product ID cannot be empty"
}
```

### 404 - 产品不存在
当产品ID格式正确但产品不存在时，应返回：
```json
{
  "message": "Product not found with ID: 9999. Please use a valid product ID (number) or item code."
}
```

### 401 - 未授权
```json
{
  "message": "Unauthorized"
}
```

### 500 - 服务器错误
```json
{
  "message": "Internal server error: {error_message}"
}
```

---

## 注意事项

1. **产品ID验证和匹配**：
   - **接受的格式**（按优先级）：
     1. **数字格式**（推荐）：数据库主键 `id`，如 `1234`、`5678`
     2. **ItemCode 格式**（向后兼容）：产品代码，如 `TI00040`
   - **查询优先级**：
     1. 首先尝试通过数字 `id`（主键）查询
     2. 如果找不到，尝试通过 `ItemCode` 查询
   - **验证函数示例**：
     ```python
     def is_valid_product_id(product_id: str) -> bool:
         """验证产品ID格式"""
         if not product_id or not isinstance(product_id, str):
             return False
         # 接受纯数字（数据库主键 id）
         # 接受包含字母和数字的字符串（如 ItemCode）
         return len(product_id.strip()) > 0
     ```

2. **数据转换**：
   - 需要将 `sales_data` 表的数据结构转换为 `BuyerProduct` 格式
   - 注意字段名称的映射（如 `Product Hierarchy 3` → `category`）

3. **价格信息**：
   - `price`: 使用最新交易价格（`TXP1`）
   - `historicalLowPrice`: 查询该产品的历史最低价
   - `lastTransactionPrice`: 最近一次交易的价格

4. **可选字段**：
   - 如果某些字段在数据库中不存在，可以返回 `null` 或省略该字段
   - 前端代码已经处理了可选字段的情况

5. **性能优化**：
   - 如果产品数据量大，考虑添加缓存
   - 对于价格统计查询，可以考虑使用物化视图或定期更新的统计表

6. **认证**：
   - 所有请求都需要验证 `Authorization: Bearer {token}` header
   - 确保token有效且用户有权限访问

---

## 测试示例

### 使用 curl 测试
```bash
# 获取产品详情
curl -X GET "http://localhost:8000/api/buyer/products/TI00040" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 预期响应
```json
{
  "id": "TI00040",
  "name": "Safety Helmet",
  "description": "Safety Equipment - Model XYZ - Plastic",
  "price": 25.99,
  "currency": "USD",
  "category": "Site Safety Equipment",
  "tags": ["Safety Equipment", "AET", "Construction", "Protection"],
  "historicalLowPrice": 20.50,
  "lastTransactionPrice": 25.99,
  "seller": {
    "id": "BUYER001",
    "name": "ABC Construction",
    "verified": false
  }
}
```

---

## 前端实现说明

### 产品ID提取规则

前端代码已经更新，确保使用正确的产品ID：

1. **ProductsListPage（产品列表页面）**：
   - 优先使用 `id`（数据库主键，推荐）
   - 如果 `id` 不存在，使用 `ItemCode`
   - 最后使用 `TXNo`（向后兼容）
   - 代码：`const productId = product.id || product.ItemCode || product.TXNo;`

2. **AISearchPage（AI搜索页面）**：
   - 最优先查找 `id` 字段（数据库主键）
   - 其次查找 `ItemCode` 字段
   - 最后查找 `TXNo` 字段
   - 接受数字格式的 `id`

### 前端验证

前端在发送请求前会验证产品ID：
- ✅ 接受：数字格式的 `id`（数据库主键，推荐）
- ✅ 接受：ItemCode 格式（如 "TI00040"）
- ✅ 接受：TXNo 格式（向后兼容）
- ✅ 如果产品ID无效，按钮会被禁用

---

## 总结

### 关键变更

1. **产品ID格式要求**：
   - **推荐使用数字格式**：数据库主键 `id`（如 `1234`）
   - **支持 ItemCode 格式**：产品代码（如 "TI00040"）
   - **向后兼容 TXNo**：交易编号

2. **后端验证**：
   - 必须实现 `is_valid_product_id()` 函数
   - 接受数字格式（数据库主键）
   - 查询优先级：数字 `id` → ItemCode

3. **前端实现**：
   - 已更新 ProductsListPage 和 AISearchPage
   - 优先使用 TXNo，其次使用 ItemCode
   - 自动过滤无效的产品ID格式

4. **错误处理**：
   - 400：无效的产品ID格式
   - 404：产品不存在
   - 401：未授权
   - 500：服务器错误

### 实现检查清单

- [ ] 实现产品ID格式验证函数
- [ ] 实现 TXNo 优先查询逻辑
- [ ] 实现 ItemCode 备用查询逻辑
- [ ] 返回正确的错误状态码和消息
- [ ] 测试纯数字ID被拒绝
- [ ] 测试有效的 TXNo 和 ItemCode 都能正常工作

