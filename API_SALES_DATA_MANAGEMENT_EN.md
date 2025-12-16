# Sales Data Management API Documentation

## Base Information

- **Base URL**: `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **Authentication**: `Authorization: Bearer {token}` (All endpoints require authentication)

---

## Endpoint 1: Get Sales Data List

### Endpoint

**GET** `/api/buyer/sales-data`

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number, starts from 1 | `1` |
| `limit` | number | No | Items per page | `20` |
| `sort` | string | No | Sort order: `newest`, `price_asc`, `price_desc` | `newest` |
| `category` | string | No | Product category filter (not sent when value is `all`) | `formwork` |
| `keyword` | string | No | Search keyword | `steel` |
| `minDate` | string | No | Minimum transaction date (YYYY-MM-DD) | `2024-01-01` |
| `maxDate` | string | No | Maximum transaction date (YYYY-MM-DD) | `2024-12-31` |
| `txNo` | string | No | Transaction number | `TX001` |
| `minQty` | number | No | Minimum quantity | `10` |
| `maxQty` | number | No | Maximum quantity | `100` |
| `minPrice` | number | No | Minimum price | `100.00` |
| `maxPrice` | number | No | Maximum price | `1000.00` |
| `minValue` | number | No | Minimum total value | `1000.00` |
| `maxValue` | number | No | Maximum total value | `10000.00` |
| `buyerCode` | string | No | Buyer code | `BUY001` |
| `buyerName` | string | No | Buyer name | `ABC Company` |
| `itemCode` | string | No | Item code | `ITEM001` |
| `itemName` | string | No | Item name | `Steel Formwork` |
| `productHierarchy3` | string | No | Product Hierarchy 3 | `Formwork Systems` |
| `itemType` | string | No | Item type | `Steel` |
| `model` | string | No | Model | `SF-2000` |
| `material` | string | No | Material | `Steel` |
| `uom` | string | No | Unit of measure | `pcs` |
| `brandCode` | string | No | Brand code | `BRAND001` |
| `performance` | string | No | Performance | `High` |
| `performance1` | string | No | Performance.1 | `Grade A` |
| `minUnitCost` | number | No | Minimum unit cost | `50.00` |
| `maxUnitCost` | number | No | Maximum unit cost | `500.00` |
| `function` | string | No | Function | `Support` |
| `sector` | string | No | Sector | `Construction` |
| `subSector` | string | No | Sub sector | `Formwork` |
| `source` | string | No | Source | `Internal` |

### Request Example

```
GET /api/buyer/sales-data?page=1&limit=20&sort=newest&keyword=steel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (HTTP 200)

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

### Response Fields

#### SalesData Object Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `TXDate` | string (DATE) | Transaction date | `"2024-01-20"` |
| `TXNo` | string | Transaction number (unique identifier) | `"TX001"` |
| `TXQty` | number | Transaction quantity | `10` |
| `TXP1` | number (DECIMAL) | Transaction price | `299.99` |
| `BuyerCode` | string | Buyer code | `"BUY001"` |
| `BuyerName` | string | Buyer name | `"ABC Construction Company"` |
| `ItemCode` | string | Item code | `"ITEM001"` |
| `ItemName` | string (TEXT) | Item name | `"Steel Formwork System"` |
| `Product Hierarchy 3` | string | Product Hierarchy 3 | `"Formwork Systems"` |
| `Function` | string | Function | `"Support"` |
| `ItemType` | string | Item type | `"Steel"` |
| `Model` | string | Model | `"SF-2000"` |
| `Performance` | string | Performance | `"High"` |
| `Performance.1` | string | Performance.1 | `"Grade A"` |
| `Material` | string | Material | `"Steel"` |
| `UOM` | string | Unit of measure | `"pcs"` |
| `Brand Code` | string | Brand code | `"BRAND001"` |
| `Unit Cost` | number (DECIMAL) | Unit cost | `250.00` |
| `Sector` | string | Sector | `"Construction"` |
| `SubSector` | string | Sub sector | `"Formwork"` |
| `Value` | number (DECIMAL) | Total value | `2999.90` |
| `Rationale` | string | Rationale | `"Standard construction material"` |
| `www` | string | Website URL | `"https://example.com/product"` |
| `Source` | string | Source | `"Internal"` |

**Note**: All fields are optional (except required fields in the database). If a field has no value, you can return `null` or omit the field.

#### Pagination Object Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total number of records |
| `totalPages` | number | Total number of pages |

### Error Responses

#### HTTP 401 - Unauthorized

```json
{
  "message": "Unauthorized",
  "errors": null,
  "error": "Invalid or expired token"
}
```

#### HTTP 500 - Internal Server Error

```json
{
  "message": "Internal server error",
  "errors": null,
  "error": "Database connection failed"
}
```

---

## Endpoint 2: Create Sales Data

### Endpoint

**POST** `/api/buyer/sales-data`

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

All fields are optional except `TXNo` (Transaction Number) which is required.

```json
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
```

### Request Example

```
POST /api/buyer/sales-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "TXNo": "TX001",
  "TXDate": "2024-01-20",
  "ItemName": "Steel Formwork System",
  "TXP1": 299.99
}
```

### Success Response (HTTP 201)

```json
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
```

### Error Responses

#### HTTP 400 - Bad Request

```json
{
  "message": "Bad Request",
  "errors": {
    "TXNo": ["Transaction number is required"]
  },
  "error": "Validation failed"
}
```

#### HTTP 409 - Conflict

```json
{
  "message": "Conflict",
  "errors": null,
  "error": "Transaction number already exists"
}
```

---

## Endpoint 3: Update Sales Data

### Endpoint

**PUT** `/api/buyer/sales-data/{txNo}`

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `txNo` | string | Yes | Transaction number (URL encoded) | `TX001` |

### Request Body

All fields are optional. Only include fields that need to be updated.

```json
{
  "TXDate": "2024-01-21",
  "TXP1": 309.99,
  "ItemName": "Updated Steel Formwork System"
}
```

### Request Example

```
PUT /api/buyer/sales-data/TX001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "TXP1": 309.99,
  "ItemName": "Updated Steel Formwork System"
}
```

### Success Response (HTTP 200)

```json
{
  "TXDate": "2024-01-21",
  "TXNo": "TX001",
  "TXQty": 10,
  "TXP1": 309.99,
  "BuyerCode": "BUY001",
  "BuyerName": "ABC Construction Company",
  "ItemCode": "ITEM001",
  "ItemName": "Updated Steel Formwork System",
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
  "Value": 3099.90,
  "Rationale": "Standard construction material",
  "www": "https://example.com/product",
  "Source": "Internal"
}
```

### Error Responses

#### HTTP 404 - Not Found

```json
{
  "message": "Not Found",
  "errors": null,
  "error": "Transaction number not found"
}
```

---

## Endpoint 4: Delete Sales Data

### Endpoint

**DELETE** `/api/buyer/sales-data/{txNo}`

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `txNo` | string | Yes | Transaction number (URL encoded) | `TX001` |

### Request Example

```
DELETE /api/buyer/sales-data/TX001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (HTTP 200)

```json
{
  "message": "Sales data deleted successfully"
}
```

### Error Responses

#### HTTP 404 - Not Found

```json
{
  "message": "Not Found",
  "errors": null,
  "error": "Transaction number not found"
}
```

---

## Sort Options

### `sort` Parameter Values

- `newest`: Sort by transaction date descending (newest first)
- `price_asc`: Sort by price ascending (low to high)
- `price_desc`: Sort by price descending (high to low)

### Sort Field Mapping

- `newest` → Order by `TXDate DESC`
- `price_asc` → Order by `TXP1 ASC`
- `price_desc` → Order by `TXP1 DESC`

---

## Category Filter

### `category` Parameter

- When `category` is `"all"`, the frontend will not send this parameter
- When `category` has a specific value, filter by `Product Hierarchy 3` or `Sector` field
- If category doesn't match, return empty array

---

## Database Table Structure

```sql
CREATE TABLE sales_data (
    TXDate DATE,
    TXNo VARCHAR(50) PRIMARY KEY,
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

## Implementation Notes

### 1. Field Names

**Important**: Some field names contain spaces or special characters:
- `Product Hierarchy 3` (contains space)
- `Brand Code` (contains space)
- `Unit Cost` (contains space)
- `Performance.1` (contains dot)

When querying the database, use backticks or square brackets:
- MySQL: `` `Product Hierarchy 3` ``
- SQL Server: `[Product Hierarchy 3]`
- PostgreSQL: `"Product Hierarchy 3"`

### 2. Date Format

- Use ISO 8601 format: `YYYY-MM-DD`
- Example: `"2024-01-20"`

### 3. Number Precision

- Use DECIMAL type for prices and costs to maintain precision
- Example: `299.99` not `299.990000`

### 4. NULL Values

- If a field is NULL, return `null` in JSON or omit the field
- Frontend handles both cases

### 5. Pagination Calculation

```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const offset = (page - 1) * limit;

// Get total count
const total = await db.query('SELECT COUNT(*) as count FROM sales_data WHERE ...');

// Calculate total pages
const totalPages = Math.ceil(total / limit);
```

### 6. SQL Query Examples

```sql
-- Basic query with pagination
SELECT * FROM sales_data 
ORDER BY TXDate DESC 
LIMIT ? OFFSET ?;

-- With sorting
SELECT * FROM sales_data 
ORDER BY 
  CASE WHEN ? = 'newest' THEN TXDate END DESC,
  CASE WHEN ? = 'price_asc' THEN TXP1 END ASC,
  CASE WHEN ? = 'price_desc' THEN TXP1 END DESC
LIMIT ? OFFSET ?;

-- With filters
SELECT * FROM sales_data 
WHERE TXNo LIKE ? 
  AND ItemName LIKE ?
  AND TXDate >= ? 
  AND TXDate <= ?
ORDER BY TXDate DESC 
LIMIT ? OFFSET ?;
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "message": "Error message",
  "errors": {
    "fieldName": ["Error detail 1", "Error detail 2"]
  },
  "error": "Detailed error description"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate transaction number
- `500 Internal Server Error`: Server error

---

## Testing Examples

### Test 1: Get Sales Data List

```bash
curl -X GET "http://localhost:8000/api/buyer/sales-data?page=1&limit=20&sort=newest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 2: Create Sales Data

```bash
curl -X POST "http://localhost:8000/api/buyer/sales-data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "TXNo": "TX001",
    "TXDate": "2024-01-20",
    "ItemName": "Steel Formwork System",
    "TXP1": 299.99,
    "TXQty": 10
  }'
```

### Test 3: Update Sales Data

```bash
curl -X PUT "http://localhost:8000/api/buyer/sales-data/TX001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "TXP1": 309.99,
    "ItemName": "Updated Steel Formwork System"
  }'
```

### Test 4: Delete Sales Data

```bash
curl -X DELETE "http://localhost:8000/api/buyer/sales-data/TX001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Frontend Integration

### TypeScript Types

```typescript
interface SalesData {
  TXDate: string | null;
  TXNo: string | null;
  TXQty: number | null;
  TXP1: number | null;
  BuyerCode: string | null;
  BuyerName: string | null;
  ItemCode: string | null;
  ItemName: string | null;
  "Product Hierarchy 3": string | null;
  Function: string | null;
  ItemType: string | null;
  Model: string | null;
  Performance: string | null;
  "Performance.1": string | null;
  Material: string | null;
  UOM: string | null;
  "Brand Code": string | null;
  "Unit Cost": number | null;
  Sector: string | null;
  SubSector: string | null;
  Value: number | null;
  Rationale: string | null;
  www: string | null;
  Source: string | null;
}
```

### Frontend API Calls

The frontend uses the following endpoints:
- `services/salesDataApi.ts` - API service functions
- `pages/SalesDataManagementPage.tsx` - Management page component

---

## Contact & Support

For questions or issues:
- Frontend API Service: `services/salesDataApi.ts`
- Frontend Page Component: `pages/SalesDataManagementPage.tsx`
- Type Definitions: `types/salesData.ts`

---

**Last Updated**: 2024-01-20









