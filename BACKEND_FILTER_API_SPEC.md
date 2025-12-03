# 后端筛选 API 接口规范

## 接口地址

**GET** `/api/buyer/sales-data`

## 请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```

## 查询参数

### 基础参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `page` | number | 否 | 页码，从1开始 | `1` |
| `limit` | number | 否 | 每页数量 | `20` |
| `sort` | string | 否 | 排序方式：`newest`, `price_asc`, `price_desc` | `newest` |
| `category` | string | 否 | 产品分类过滤（当值为`all`时不传此参数） | `formwork` |
| `keyword` | string | 否 | 搜索关键词（可选） | `TI00040` |

### 筛选参数 - 交易相关

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `minDate` | string | 否 | 最早交易日期 | `TXDate` | `2024-01-01` |
| `maxDate` | string | 否 | 最晚交易日期 | `TXDate` | `2024-12-31` |
| `txNo` | string | 否 | 交易编号（模糊匹配） | `TXNo` | `SI/INV9066247` |
| `minQty` | number | 否 | 最小交易数量 | `TXQty` | `10` |
| `maxQty` | number | 否 | 最大交易数量 | `TXQty` | `100` |
| `minPrice` | number | 否 | 最低交易价格 | `TXP1` | `100.00` |
| `maxPrice` | number | 否 | 最高交易价格 | `TXP1` | `1000.00` |
| `minValue` | number | 否 | 最小总价值 | `Value` | `1000.00` |
| `maxValue` | number | 否 | 最大总价值 | `Value` | `10000.00` |

### 筛选参数 - 买家相关

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `buyerCode` | string | 否 | 买家代码（模糊匹配） | `BuyerCode` | `BUY001` |
| `buyerName` | string | 否 | 买家名称（模糊匹配） | `BuyerName` | `ABC Company` |

### 筛选参数 - 产品相关

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `itemCode` | string | 否 | 产品代码（模糊匹配） | `ItemCode` | `TI00040` |
| `itemName` | string | 否 | 产品名称（模糊匹配） | `ItemName` | `安全鞋` |
| `productHierarchy3` | string | 否 | 产品分类层级3（模糊匹配） | `Product Hierarchy 3` | `Site Safety Equipment` |
| `itemType` | string | 否 | 产品类型（模糊匹配） | `ItemType` | `Steel` |
| `model` | string | 否 | 型号（模糊匹配） | `Model` | `SF-2000` |
| `material` | string | 否 | 材料（模糊匹配） | `Material` | `Steel` |
| `uom` | string | 否 | 单位（模糊匹配） | `UOM` | `pcs` |

### 筛选参数 - 品牌和性能

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `brandCode` | string | 否 | 品牌代码（模糊匹配） | `Brand Code` | `BRAND001` |
| `performance` | string | 否 | 性能（模糊匹配） | `Performance` | `High` |
| `performance1` | string | 否 | 性能1（模糊匹配） | `Performance.1` | `Grade A` |

### 筛选参数 - 成本和功能

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `minUnitCost` | number | 否 | 最小单位成本 | `Unit Cost` | `50.00` |
| `maxUnitCost` | number | 否 | 最大单位成本 | `Unit Cost` | `500.00` |
| `function` | string | 否 | 功能（模糊匹配） | `Function` | `Support` |

### 筛选参数 - 行业相关

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `sector` | string | 否 | 行业（模糊匹配） | `Sector` | `Construction` |
| `subSector` | string | 否 | 子行业（模糊匹配） | `SubSector` | `Formwork` |

### 筛选参数 - 其他

| 参数名 | 类型 | 必填 | 说明 | 数据库字段 | 示例 |
|--------|------|------|------|------------|------|
| `source` | string | 否 | 来源（模糊匹配） | `Source` | `Internal` |

## 请求示例

### 示例 1: 基础查询
```
GET /api/buyer/sales-data?page=1&limit=20&sort=newest
```

### 示例 2: 带关键词搜索
```
GET /api/buyer/sales-data?page=1&limit=20&keyword=TI00040
```

### 示例 3: 带价格范围筛选
```
GET /api/buyer/sales-data?page=1&limit=20&minPrice=100&maxPrice=1000
```

### 示例 4: 带日期范围筛选
```
GET /api/buyer/sales-data?page=1&limit=20&minDate=2024-01-01&maxDate=2024-12-31
```

### 示例 5: 组合筛选
```
GET /api/buyer/sales-data?page=1&limit=20&sort=price_asc&minPrice=100&maxPrice=1000&buyerName=ABC&itemType=Steel&sector=Construction
```

## 筛选逻辑说明

### 数值范围筛选
- `minPrice`, `maxPrice`: 筛选 `TXP1` 字段，使用 `>=` 和 `<=` 比较
- `minQty`, `maxQty`: 筛选 `TXQty` 字段，使用 `>=` 和 `<=` 比较
- `minValue`, `maxValue`: 筛选 `Value` 字段，使用 `>=` 和 `<=` 比较
- `minUnitCost`, `maxUnitCost`: 筛选 `Unit Cost` 字段，使用 `>=` 和 `<=` 比较

### 日期范围筛选
- `minDate`, `maxDate`: 筛选 `TXDate` 字段，使用 `>=` 和 `<=` 比较
- 日期格式：`YYYY-MM-DD`

### 文本模糊匹配
以下字段使用模糊匹配（LIKE 或 CONTAINS）：
- `txNo` → `TXNo`
- `buyerCode` → `BuyerCode`
- `buyerName` → `BuyerName`
- `itemCode` → `ItemCode`
- `itemName` → `ItemName`
- `productHierarchy3` → `Product Hierarchy 3`
- `itemType` → `ItemType`
- `model` → `Model`
- `material` → `Material`
- `uom` → `UOM`
- `brandCode` → `Brand Code`
- `performance` → `Performance`
- `performance1` → `Performance.1`
- `function` → `Function`
- `sector` → `Sector`
- `subSector` → `SubSector`
- `source` → `Source`

**注意**: 模糊匹配应该不区分大小写，例如：
- SQL: `WHERE ItemName LIKE '%安全鞋%'` 或 `WHERE LOWER(ItemName) LIKE LOWER('%安全鞋%')`
- 或者使用 `ILIKE` (PostgreSQL) 或 `LIKE` with `COLLATE` (MySQL)

## SQL 查询示例

```sql
-- 基础查询
SELECT * FROM sales_data 
WHERE 1=1
  AND (TXDate >= ? OR ? IS NULL)
  AND (TXDate <= ? OR ? IS NULL)
  AND (TXNo LIKE ? OR ? IS NULL)
  AND (TXQty >= ? OR ? IS NULL)
  AND (TXQty <= ? OR ? IS NULL)
  AND (TXP1 >= ? OR ? IS NULL)
  AND (TXP1 <= ? OR ? IS NULL)
  AND (Value >= ? OR ? IS NULL)
  AND (Value <= ? OR ? IS NULL)
  AND (BuyerCode LIKE ? OR ? IS NULL)
  AND (BuyerName LIKE ? OR ? IS NULL)
  AND (ItemCode LIKE ? OR ? IS NULL)
  AND (ItemName LIKE ? OR ? IS NULL)
  AND (`Product Hierarchy 3` LIKE ? OR ? IS NULL)
  AND (ItemType LIKE ? OR ? IS NULL)
  AND (Model LIKE ? OR ? IS NULL)
  AND (Material LIKE ? OR ? IS NULL)
  AND (UOM LIKE ? OR ? IS NULL)
  AND (`Brand Code` LIKE ? OR ? IS NULL)
  AND (Performance LIKE ? OR ? IS NULL)
  AND (`Performance.1` LIKE ? OR ? IS NULL)
  AND (`Unit Cost` >= ? OR ? IS NULL)
  AND (`Unit Cost` <= ? OR ? IS NULL)
  AND (`Function` LIKE ? OR ? IS NULL)
  AND (Sector LIKE ? OR ? IS NULL)
  AND (SubSector LIKE ? OR ? IS NULL)
  AND (Source LIKE ? OR ? IS NULL)
ORDER BY 
  CASE WHEN ? = 'newest' THEN TXDate END DESC,
  CASE WHEN ? = 'price_asc' THEN TXP1 END ASC,
  CASE WHEN ? = 'price_desc' THEN TXP1 END DESC
LIMIT ? OFFSET ?;
```

## 响应格式

响应格式保持不变，与现有的 `/api/buyer/sales-data` 接口相同：

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

## 注意事项

1. **字段名**: 注意数据库中有带空格的字段名（如 `Product Hierarchy 3`、`Brand Code`、`Unit Cost`、`Performance.1`），需要使用反引号或方括号包裹

2. **NULL 值处理**: 
   - 如果筛选字段为 NULL，应该跳过该筛选条件
   - 例如：如果 `minPrice` 未提供，则不应用价格下限筛选

3. **模糊匹配**: 
   - 文本字段应该使用 `LIKE '%value%'` 进行模糊匹配
   - 建议不区分大小写

4. **分页**: 
   - `total` 应该是所有符合条件的记录总数（应用所有筛选条件后）
   - `totalPages` 应该基于筛选后的总数计算

5. **性能优化**: 
   - 建议在常用筛选字段上创建索引
   - 例如：`TXDate`, `TXP1`, `BuyerCode`, `ItemCode`, `ItemName` 等

6. **参数验证**: 
   - 验证数值参数的有效性（不能为负数等）
   - 验证日期格式
   - 验证字符串参数的长度限制

