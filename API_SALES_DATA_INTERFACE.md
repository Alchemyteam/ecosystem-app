# Sales Data API 接口规范

## 基础信息

- **基础URL**: `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **认证方式**: `Authorization: Bearer {token}` (所有接口都需要认证)

---

## 接口：获取销售数据列表

### 接口地址

**GET** `/api/buyer/sales-data`

### 请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```

### 查询参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `page` | number | 否 | 页码，从1开始 | `1` |
| `limit` | number | 否 | 每页数量 | `20` |
| `sort` | string | 否 | 排序方式：`newest`, `price_asc`, `price_desc` | `newest` |
| `category` | string | 否 | 产品分类过滤（当值为`all`时不传此参数） | `formwork` |

### 请求示例

```
GET /api/buyer/sales-data?page=1&limit=20&sort=newest
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应 (HTTP 200)

```json
{
  "data": [
    {
      "TXDate": "2024-01-20",
      "TXNo": "TX001",
      "TXQty": 10,
      "TXP1": 299.99,
      "BuyerCode": "BUY001",
      "BuyerName": "ABC Construction Company",
      "ItemCode": "ITEM001",
      "ItemName": "Steel Formwork System",
      "Product Hierarchy 3": "Formwork Systems",
      "Function": "Support",
      "ItemType": "Steel",
      "Model": "SF-2000",
      "Performance": "High",
      "Performance.1": "Grade A",
      "Material": "Steel",
      "UOM": "pcs",
      "Brand Code": "BRAND001",
      "Unit Cost": 250.00,
      "Sector": "Construction",
      "SubSector": "Formwork",
      "Value": 2999.90,
      "Rationale": "Standard construction material",
      "www": "https://example.com/product",
      "Source": "Internal"
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

### 响应字段说明

#### SalesData 对象字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `TXDate` | string (DATE) | 交易日期 | `"2024-01-20"` |
| `TXNo` | string | 交易编号（唯一标识） | `"TX001"` |
| `TXQty` | number | 交易数量 | `10` |
| `TXP1` | number (DECIMAL) | 交易价格 | `299.99` |
| `BuyerCode` | string | 买家代码 | `"BUY001"` |
| `BuyerName` | string | 买家名称 | `"ABC Construction Company"` |
| `ItemCode` | string | 产品代码 | `"ITEM001"` |
| `ItemName` | string (TEXT) | 产品名称 | `"Steel Formwork System"` |
| `Product Hierarchy 3` | string | 产品分类层级3 | `"Formwork Systems"` |
| `Function` | string | 功能 | `"Support"` |
| `ItemType` | string | 产品类型 | `"Steel"` |
| `Model` | string | 型号 | `"SF-2000"` |
| `Performance` | string | 性能 | `"High"` |
| `Performance.1` | string | 性能1 | `"Grade A"` |
| `Material` | string | 材料 | `"Steel"` |
| `UOM` | string | 单位 | `"pcs"` |
| `Brand Code` | string | 品牌代码 | `"BRAND001"` |
| `Unit Cost` | number (DECIMAL) | 单位成本 | `250.00` |
| `Sector` | string | 行业 | `"Construction"` |
| `SubSector` | string | 子行业 | `"Formwork"` |
| `Value` | number (DECIMAL) | 总价值 | `2999.90` |
| `Rationale` | string | 理由 | `"Standard construction material"` |
| `www` | string | 网址 | `"https://example.com/product"` |
| `Source` | string | 来源 | `"Internal"` |

**注意**: 所有字段都是可选的（除了数据库中的必填字段），如果某个字段没有值，可以返回 `null` 或省略该字段。

#### Pagination 对象字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `page` | number | 当前页码 |
| `limit` | number | 每页数量 |
| `total` | number | 总记录数 |
| `totalPages` | number | 总页数 |

### 错误响应

#### HTTP 401 - 未授权

```json
{
  "message": "Unauthorized",
  "errors": null,
  "error": "Invalid or expired token"
}
```

#### HTTP 500 - 服务器错误

```json
{
  "message": "Internal server error",
  "errors": null,
  "error": "Database connection failed"
}
```

---

## 排序方式说明

### `sort` 参数可选值

- `newest`: 按交易日期降序（最新的在前）
- `price_asc`: 按价格升序（从低到高）
- `price_desc`: 按价格降序（从高到低）
- `rating_desc`: 此选项在前端存在但可能不适用于销售数据，可以忽略或按其他字段排序

### 排序字段映射

- `newest` → 按 `TXDate DESC`
- `price_asc` → 按 `TXP1 ASC`
- `price_desc` → 按 `TXP1 DESC`

---

## 分类过滤说明

### `category` 参数

- 当 `category` 为 `"all"` 时，前端不会传递此参数
- 当 `category` 有具体值时，应该根据 `Product Hierarchy 3` 或 `Sector` 字段进行过滤
- 如果分类不匹配，返回空数组

---

## 数据库表结构参考

```sql
CREATE TABLE sales_data (
    TXDate DATE,
    TXNo VARCHAR(50),
    TXQty INT,
    TXP1 DECIMAL(10,2),
    BuyerCode VARCHAR(20),
    BuyerName VARCHAR(255),
    ItemCode VARCHAR(50),
    ItemName TEXT,
    `Product Hierarchy 3` VARCHAR(100),
    `Function` VARCHAR(100),
    ItemType VARCHAR(100),
    Model VARCHAR(100),
    Performance VARCHAR(100),
    `Performance.1` VARCHAR(100),
    Material VARCHAR(100),
    UOM VARCHAR(50),
    `Brand Code` VARCHAR(50),
    `Unit Cost` DECIMAL(10,4),
    Sector VARCHAR(100),
    SubSector VARCHAR(100),
    Value DECIMAL(10,4),
    Rationale VARCHAR(255),
    www VARCHAR(255),
    Source VARCHAR(50)
);
```

---

## 实现建议

### 1. SQL 查询示例

```sql
-- 基础查询
SELECT * FROM sales_data 
ORDER BY TXDate DESC 
LIMIT 20 OFFSET 0;

-- 带分页
SELECT * FROM sales_data 
ORDER BY TXDate DESC 
LIMIT ? OFFSET ?;

-- 带排序
SELECT * FROM sales_data 
ORDER BY 
  CASE WHEN ? = 'newest' THEN TXDate END DESC,
  CASE WHEN ? = 'price_asc' THEN TXP1 END ASC,
  CASE WHEN ? = 'price_desc' THEN TXP1 END DESC
LIMIT ? OFFSET ?;

-- 带分类过滤
SELECT * FROM sales_data 
WHERE `Product Hierarchy 3` = ? OR Sector = ?
ORDER BY TXDate DESC 
LIMIT ? OFFSET ?;
```

### 2. 分页计算

```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const offset = (page - 1) * limit;

// 获取总数
const total = await db.query('SELECT COUNT(*) as count FROM sales_data');

// 计算总页数
const totalPages = Math.ceil(total / limit);
```

### 3. 响应格式

确保返回的数据格式完全符合上述规范，特别是：
- 字段名必须与数据库列名完全一致（包括带空格的字段名）
- 日期格式使用 ISO 8601 格式：`YYYY-MM-DD`
- 数字类型保持精度（DECIMAL 类型）

---

## 测试用例

### 测试 1: 基础查询

```
GET /api/buyer/sales-data?page=1&limit=20
```

### 测试 2: 带排序

```
GET /api/buyer/sales-data?page=1&limit=20&sort=price_asc
```

### 测试 3: 带分类过滤

```
GET /api/buyer/sales-data?page=1&limit=20&category=formwork
```

### 测试 4: 组合查询

```
GET /api/buyer/sales-data?page=2&limit=10&sort=price_desc&category=Construction
```

---

## 注意事项

1. **字段名**: 注意数据库中有带空格的字段名（如 `Product Hierarchy 3`、`Brand Code`、`Unit Cost`、`Performance.1`），需要使用反引号或方括号包裹
2. **日期格式**: `TXDate` 应该返回字符串格式的日期，如 `"2024-01-20"`
3. **NULL 值处理**: 如果某些字段为 NULL，可以返回 `null` 或省略该字段
4. **分页**: 确保分页逻辑正确，`total` 应该是所有符合条件的记录总数，而不是当前页的记录数
5. **认证**: 所有请求都需要验证 token，如果 token 无效或过期，返回 401 错误

---

## 前端调用示例

```typescript
// 前端代码示例
const response = await fetch('/api/buyer/sales-data?page=1&limit=20&sort=newest', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
// result.data 是 SalesData[] 数组
// result.pagination 是分页信息
```

---

## 联系信息

如有问题，请参考前端代码：
- API 服务文件: `services/api.ts`
- 页面组件: `pages/ProductsListPage.tsx`
- 类型定义: `services/api.ts` 中的 `SalesData` 接口


