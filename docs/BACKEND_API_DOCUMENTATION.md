# 后端 API 接口文档

## 基础信息

### Base URL
```
开发环境: http://localhost:8000/api
生产环境: {根据实际部署环境配置}
```

### 认证方式
所有需要认证的接口都需要在请求头中携带 JWT Token：
```
Authorization: Bearer {token}
```

### 响应格式
所有接口统一返回 JSON 格式数据（文件下载接口除外）。

**成功响应示例：**
```json
{
  "data": {...},
  "message": "Success"
}
```

**错误响应示例：**
```json
{
  "message": "Error message",
  "errors": {
    "field": ["error detail"]
  }
}
```

---

## 认证相关接口

### 1. 用户登录
**POST** `/auth/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 2. 用户注册
**POST** `/auth/register`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 3. 获取当前用户信息
**GET** `/auth/me`

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name"
}
```

### 4. 验证 Token
**GET** `/auth/verify`

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "valid": true
}
```

### 5. Business Central SSO 回调
**POST** `/auth/bc/callback`

**请求体：**
```json
{
  "code": "authorization_code_from_bc",
  "state": "state_parameter",
  "code_verifier": "pkce_code_verifier",
  "redirect_uri": "http://localhost:3000/auth/bc/callback"
}
```

**响应：**
```json
{
  "token": "jwt_token_for_local_system",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "bcUserId": "bc_user_id"
  }
}
```

---

## 销售数据管理接口

### 1. 获取销售数据列表
**GET** `/buyer/sales-data`

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，从1开始，默认1 |
| limit | number | 否 | 每页数量，默认20，最大100 |
| sort | string | 否 | 排序方式：newest, price_asc, price_desc |
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 产品分类过滤 |
| minDate | string | 否 | 最早交易日期 (YYYY-MM-DD) |
| maxDate | string | 否 | 最晚交易日期 (YYYY-MM-DD) |
| txNo | string | 否 | 交易编号 |
| minQty | number | 否 | 最小数量 |
| maxQty | number | 否 | 最大数量 |
| minPrice | number | 否 | 最低价格 |
| maxPrice | number | 否 | 最高价格 |
| buyerCode | string | 否 | 买家代码 |
| buyerName | string | 否 | 买家名称 |
| itemCode | string | 否 | 产品代码 |
| itemName | string | 否 | 产品名称 |

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "data": [
    {
      "id": 1,
      "TXDate": "2024-01-20",
      "TXNo": "TXN-2024-001",
      "TXQty": 10,
      "TXP1": 100.50,
      "BuyerCode": "BUYER001",
      "BuyerName": "Buyer Company",
      "ItemCode": "ITEM001",
      "ItemName": "Product Name",
      "Product Hierarchy 3": "Category",
      "ItemType": "Type",
      "Model": "Model123",
      "Material": "Steel",
      "UOM": "PCS",
      "Brand Code": "BRAND001",
      "Unit Cost": 80.00,
      "Sector": "Manufacturing",
      "SubSector": "Electronics",
      "Value": 1005.00,
      "Function": "Function description",
      "Performance": "Performance data",
      "Performance.1": "Performance.1 data",
      "Rationale": "Rationale description",
      "www": "https://example.com",
      "Source": "Source information"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 2. 获取产品分类列表
**GET** `/buyer/sales-data/categories`

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "categories": ["Category1", "Category2", "Category3"]
}
```

或直接返回数组：
```json
["Category1", "Category2", "Category3"]
```

### 3. 下载 Excel 模板 ⭐ 新增
**GET** `/buyer/sales-data/template`

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` 或 `application/octet-stream`
- **Content-Disposition**: `attachment; filename="Sales_Data_Template.xlsx"`
- **响应体**: Excel 文件的二进制数据

**说明：**
- 返回一个包含表头和示例行的 Excel 模板文件
- 表头应包含所有必需的字段（见下方字段列表）
- 第一行数据应为示例数据（TXNo 字段应有示例值）

**Excel 模板字段列表（按顺序）：**
1. Transaction Date (TXDate)
2. Transaction Number (TXNo) - 必填
3. Transaction Quantity (TXQty)
4. Transaction Price (TXP1)
5. Buyer Code (BuyerCode)
6. Buyer Name (BuyerName)
7. Item Code (ItemCode)
8. Item Name (ItemName)
9. Product Hierarchy 3
10. Item Type (ItemType)
11. Model
12. Material
13. Unit of Measure (UOM)
14. Brand Code
15. Unit Cost
16. Sector
17. Sub Sector (SubSector)
18. Value
19. Function
20. Performance
21. Performance.1
22. Rationale
23. Website (www)
24. Source

### 4. 创建销售数据
**POST** `/buyer/sales-data`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体：**
```json
{
  "TXDate": "2024-01-20",
  "TXNo": "TXN-2024-001",
  "TXQty": 10,
  "TXP1": 100.50,
  "BuyerCode": "BUYER001",
  "BuyerName": "Buyer Company",
  "ItemCode": "ITEM001",
  "ItemName": "Product Name",
  "Product Hierarchy 3": "Category",
  "ItemType": "Type",
  "Model": "Model123",
  "Material": "Steel",
  "UOM": "PCS",
  "Brand Code": "BRAND001",
  "Unit Cost": 80.00,
  "Sector": "Manufacturing",
  "SubSector": "Electronics",
  "Value": 1005.00,
  "Function": "Function description",
  "Performance": "Performance data",
  "Performance.1": "Performance.1 data",
  "Rationale": "Rationale description",
  "www": "https://example.com",
  "Source": "Source information"
}
```

**注意：** 所有字段都是可选的，但建议至少提供 `TXNo`（交易编号）作为唯一标识。

**响应：**
```json
{
  "id": 1,
  "TXDate": "2024-01-20",
  "TXNo": "TXN-2024-001",
  // ... 其他字段
}
```

### 5. 更新销售数据
**PUT** `/buyer/sales-data/{txNo}`

**路径参数：**
- `txNo`: 交易编号（URL 编码）

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体：**
```json
{
  "TXQty": 20,
  "TXP1": 150.00,
  // ... 其他要更新的字段
}
```

**响应：**
```json
{
  "id": 1,
  "TXDate": "2024-01-20",
  "TXNo": "TXN-2024-001",
  "TXQty": 20,
  "TXP1": 150.00,
  // ... 其他字段
}
```

### 6. 删除销售数据
**DELETE** `/buyer/sales-data/{txNo}`

**路径参数：**
- `txNo`: 交易编号（URL 编码）

**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "message": "Sales data deleted successfully"
}
```

### 7. 批量导入销售数据（上传 Excel 文件）⭐ 新增
**POST** `/buyer/sales-data/bulk-import`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求体：**
- 使用 `multipart/form-data` 格式
- 文件字段名：`file`
- 文件类型：`.xlsx` 或 `.xls`

**请求示例（使用 curl）：**
```bash
curl -X POST "http://localhost:8000/api/buyer/sales-data/bulk-import" \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/file.xlsx"
```

**Excel 文件要求：**
- 第一行必须是表头，包含所有必需的字段名
- 表头名称应与模板中的字段名完全匹配（不区分大小写，但空格需匹配）
- 从第二行开始是数据行
- Transaction Number (TXNo) 是必填字段

**响应：**
```json
{
  "success": 8,
  "failed": 2,
  "errors": [
    "Row 3: Transaction Number (TXNo) is required",
    "Row 7: Invalid date format for TXDate. Expected YYYY-MM-DD"
  ]
}
```

**响应字段说明：**
- `success`: 成功导入的记录数
- `failed`: 失败的记录数
- `errors`: 错误信息数组，包含每个失败记录的详细错误信息

**错误处理：**
- 如果某条记录验证失败，该记录不会被导入，但其他记录仍会继续处理
- 建议在错误信息中包含行号，方便用户定位问题
- 常见的验证错误包括：
  - 必填字段缺失（TXNo）
  - 日期格式错误
  - 数字格式错误
  - 数据类型不匹配

**实现建议：**
1. 使用数据库事务确保数据一致性
2. 对每条记录进行验证：
   - 检查必填字段
   - 验证数据类型
   - 验证日期格式（YYYY-MM-DD）
   - 检查数据范围（如价格不能为负数）
3. 如果 `TXNo` 已存在，可以选择：
   - 跳过该记录（不更新）
   - 更新现有记录
   - 返回错误信息
4. 建议限制单次导入的记录数量（如最多 1000 条），防止超时

---

## 数据模型

### SalesData 数据模型

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | number/string | 数据库主键ID | 1 |
| TXDate | string/null | 交易日期 | "2024-01-20" |
| TXNo | string/null | 交易编号（唯一标识，必填） | "TXN-2024-001" |
| TXQty | number/null | 交易数量 | 10 |
| TXP1 | number/null | 交易价格 | 100.50 |
| BuyerCode | string/null | 买家代码 | "BUYER001" |
| BuyerName | string/null | 买家名称 | "Buyer Company" |
| ItemCode | string/null | 产品代码 | "ITEM001" |
| ItemName | string/null | 产品名称 | "Product Name" |
| Product Hierarchy 3 | string/null | 产品分类层级3 | "Category" |
| ItemType | string/null | 产品类型 | "Type" |
| Model | string/null | 型号 | "Model123" |
| Material | string/null | 材料 | "Steel" |
| UOM | string/null | 单位 | "PCS" |
| Brand Code | string/null | 品牌代码 | "BRAND001" |
| Unit Cost | number/null | 单位成本 | 80.00 |
| Sector | string/null | 行业 | "Manufacturing" |
| SubSector | string/null | 子行业 | "Electronics" |
| Value | number/null | 总价值 | 1005.00 |
| Function | string/null | 功能 | "Function description" |
| Performance | string/null | 性能 | "Performance data" |
| Performance.1 | string/null | 性能1 | "Performance.1 data" |
| Rationale | string/null | 理由 | "Rationale description" |
| www | string/null | 网址 | "https://example.com" |
| Source | string/null | 来源 | "Source information" |

---

## 错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

---

## 实现示例代码

### Python (FastAPI) 实现示例

#### 1. 下载 Excel 模板

```python
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from openpyxl import Workbook
from io import BytesIO
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/buyer/sales-data/template")
async def download_template(
    current_user: dict = Depends(get_current_user)
):
    """下载 Excel 模板文件"""
    # 创建工作簿
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Sales Data Template"
    
    # 设置表头
    headers = [
        "Transaction Date",
        "Transaction Number",
        "Transaction Quantity",
        "Transaction Price",
        "Buyer Code",
        "Buyer Name",
        "Item Code",
        "Item Name",
        "Product Hierarchy 3",
        "Item Type",
        "Model",
        "Material",
        "Unit of Measure",
        "Brand Code",
        "Unit Cost",
        "Sector",
        "Sub Sector",
        "Value",
        "Function",
        "Performance",
        "Performance.1",
        "Rationale",
        "Website",
        "Source"
    ]
    sheet.append(headers)
    
    # 添加示例行
    example_row = [
        "2024-01-20",  # Transaction Date
        "TXN-2024-001",  # Transaction Number (必填字段示例)
        "",  # Transaction Quantity
        "",  # Transaction Price
        "",  # Buyer Code
        "",  # Buyer Name
        "",  # Item Code
        "",  # Item Name
        "",  # Product Hierarchy 3
        "",  # Item Type
        "",  # Model
        "",  # Material
        "",  # Unit of Measure
        "",  # Brand Code
        "",  # Unit Cost
        "",  # Sector
        "",  # Sub Sector
        "",  # Value
        "",  # Function
        "",  # Performance
        "",  # Performance.1
        "",  # Rationale
        "",  # Website
        ""   # Source
    ]
    sheet.append(example_row)
    
    # 设置列宽
    for col in sheet.columns:
        sheet.column_dimensions[col[0].column_letter].width = 20
    
    # 保存到内存
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    
    return StreamingResponse(
        BytesIO(output.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="Sales_Data_Template.xlsx"'
        }
    )
```

#### 2. 批量导入 Excel 文件

```python
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from openpyxl import load_workbook
from typing import List
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# 字段映射：Excel 表头 -> 数据库字段
FIELD_MAPPING = {
    "Transaction Date": "TXDate",
    "Transaction Number": "TXNo",
    "Transaction Quantity": "TXQty",
    "Transaction Price": "TXP1",
    "Buyer Code": "BuyerCode",
    "Buyer Name": "BuyerName",
    "Item Code": "ItemCode",
    "Item Name": "ItemName",
    "Product Hierarchy 3": "Product Hierarchy 3",
    "Item Type": "ItemType",
    "Model": "Model",
    "Material": "Material",
    "Unit of Measure": "UOM",
    "Brand Code": "Brand Code",
    "Unit Cost": "Unit Cost",
    "Sector": "Sector",
    "Sub Sector": "SubSector",
    "Value": "Value",
    "Function": "Function",
    "Performance": "Performance",
    "Performance.1": "Performance.1",
    "Rationale": "Rationale",
    "Website": "www",
    "Source": "Source"
}

@router.post("/buyer/sales-data/bulk-import")
async def bulk_import_sales_data(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """批量导入销售数据（从 Excel 文件）"""
    success_count = 0
    failed_count = 0
    errors = []
    
    try:
        # 读取 Excel 文件
        contents = await file.read()
        workbook = load_workbook(filename=BytesIO(contents), data_only=True)
        sheet = workbook.active
        
        # 获取表头（第一行）
        headers = []
        for cell in sheet[1]:
            headers.append(str(cell.value).strip() if cell.value else "")
        
        # 验证表头
        header_map = {}
        for expected_header, db_field in FIELD_MAPPING.items():
            found_index = None
            for i, header in enumerate(headers):
                if header.lower().strip() == expected_header.lower().strip():
                    found_index = i
                    break
            if found_index is not None:
                header_map[expected_header] = (found_index, db_field)
            else:
                errors.append(f"Missing required column: {expected_header}")
        
        if errors:
            return {
                "success": 0,
                "failed": 0,
                "errors": errors
            }
        
        # 处理数据行（从第二行开始）
        for row_num, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
            # 跳过空行
            if all(cell is None or str(cell).strip() == "" for cell in row):
                continue
            
            try:
                row_data = {}
                
                # 映射数据
                for expected_header, (col_index, db_field) in header_map.items():
                    cell_value = row[col_index] if col_index < len(row) else None
                    
                    # 处理不同类型的值
                    if cell_value is None or str(cell_value).strip() == "":
                        row_data[db_field] = None
                    elif db_field == "TXDate":
                        # 处理日期
                        if isinstance(cell_value, datetime):
                            row_data[db_field] = cell_value.strftime("%Y-%m-%d")
                        else:
                            try:
                                date_obj = datetime.strptime(str(cell_value), "%Y-%m-%d")
                                row_data[db_field] = date_obj.strftime("%Y-%m-%d")
                            except:
                                row_data[db_field] = str(cell_value).strip() or None
                    elif db_field in ["TXQty", "TXP1", "Unit Cost", "Value"]:
                        # 处理数字字段
                        try:
                            num_value = float(cell_value) if cell_value else None
                            row_data[db_field] = num_value if num_value is not None and num_value >= 0 else None
                        except:
                            row_data[db_field] = None
                    else:
                        # 处理文本字段
                        row_data[db_field] = str(cell_value).strip() if cell_value else None
                
                # 验证必填字段
                if not row_data.get("TXNo") or not str(row_data["TXNo"]).strip():
                    errors.append(f"Row {row_num}: Transaction Number (TXNo) is required")
                    failed_count += 1
                    continue
                
                # 验证日期格式
                if row_data.get("TXDate"):
                    try:
                        datetime.strptime(row_data["TXDate"], "%Y-%m-%d")
                    except:
                        errors.append(f"Row {row_num}: Invalid date format for TXDate. Expected YYYY-MM-DD")
                        failed_count += 1
                        continue
                
                # 保存到数据库
                # 检查是否已存在
                existing = await db.sales_data.find_one({"TXNo": row_data["TXNo"]})
                if existing:
                    # 更新现有记录
                    await db.sales_data.update_one(
                        {"TXNo": row_data["TXNo"]},
                        {"$set": {**row_data, "updated_at": datetime.utcnow()}}
                    )
                else:
                    # 插入新记录
                    await db.sales_data.insert_one({
                        **row_data,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    })
                
                success_count += 1
                
            except Exception as e:
                logger.error(f"Error processing row {row_num}: {str(e)}")
                errors.append(f"Row {row_num}: {str(e)}")
                failed_count += 1
        
        return {
            "success": success_count,
            "failed": failed_count,
            "errors": errors
        }
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process file: {str(e)}"
        )
```

### Node.js (Express) 实现示例

#### 1. 下载 Excel 模板

```javascript
const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

router.get('/buyer/sales-data/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Data Template');
    
    // 设置表头
    worksheet.columns = [
      { header: 'Transaction Date', key: 'TXDate', width: 20 },
      { header: 'Transaction Number', key: 'TXNo', width: 20 },
      { header: 'Transaction Quantity', key: 'TXQty', width: 20 },
      { header: 'Transaction Price', key: 'TXP1', width: 20 },
      { header: 'Buyer Code', key: 'BuyerCode', width: 20 },
      { header: 'Buyer Name', key: 'BuyerName', width: 20 },
      { header: 'Item Code', key: 'ItemCode', width: 20 },
      { header: 'Item Name', key: 'ItemName', width: 20 },
      { header: 'Product Hierarchy 3', key: 'ProductHierarchy3', width: 20 },
      { header: 'Item Type', key: 'ItemType', width: 20 },
      { header: 'Model', key: 'Model', width: 20 },
      { header: 'Material', key: 'Material', width: 20 },
      { header: 'Unit of Measure', key: 'UOM', width: 20 },
      { header: 'Brand Code', key: 'BrandCode', width: 20 },
      { header: 'Unit Cost', key: 'UnitCost', width: 20 },
      { header: 'Sector', key: 'Sector', width: 20 },
      { header: 'Sub Sector', key: 'SubSector', width: 20 },
      { header: 'Value', key: 'Value', width: 20 },
      { header: 'Function', key: 'Function', width: 20 },
      { header: 'Performance', key: 'Performance', width: 20 },
      { header: 'Performance.1', key: 'Performance1', width: 20 },
      { header: 'Rationale', key: 'Rationale', width: 20 },
      { header: 'Website', key: 'www', width: 20 },
      { header: 'Source', key: 'Source', width: 20 }
    ];
    
    // 添加示例行
    worksheet.addRow({
      TXDate: '2024-01-20',
      TXNo: 'TXN-2024-001',
      TXQty: null,
      TXP1: null,
      BuyerCode: null,
      BuyerName: null,
      ItemCode: null,
      ItemName: null,
      ProductHierarchy3: null,
      ItemType: null,
      Model: null,
      Material: null,
      UOM: null,
      BrandCode: null,
      UnitCost: null,
      Sector: null,
      SubSector: null,
      Value: null,
      Function: null,
      Performance: null,
      Performance1: null,
      Rationale: null,
      www: null,
      Source: null
    });
    
    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Sales_Data_Template.xlsx"'
    );
    
    // 发送文件
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate template', error: error.message });
  }
});
```

#### 2. 批量导入 Excel 文件

```javascript
const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/buyer/sales-data/bulk-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.worksheets[0];
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // 获取表头（第一行）
    const headers = [];
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = cell.value ? String(cell.value).trim() : '';
    });
    
    // 字段映射
    const fieldMapping = {
      'Transaction Date': 'TXDate',
      'Transaction Number': 'TXNo',
      'Transaction Quantity': 'TXQty',
      'Transaction Price': 'TXP1',
      'Buyer Code': 'BuyerCode',
      'Buyer Name': 'BuyerName',
      'Item Code': 'ItemCode',
      'Item Name': 'ItemName',
      'Product Hierarchy 3': 'Product Hierarchy 3',
      'Item Type': 'ItemType',
      'Model': 'Model',
      'Material': 'Material',
      'Unit of Measure': 'UOM',
      'Brand Code': 'Brand Code',
      'Unit Cost': 'Unit Cost',
      'Sector': 'Sector',
      'Sub Sector': 'SubSector',
      'Value': 'Value',
      'Function': 'Function',
      'Performance': 'Performance',
      'Performance.1': 'Performance.1',
      'Rationale': 'Rationale',
      'Website': 'www',
      'Source': 'Source'
    };
    
    // 验证表头
    const headerMap = {};
    for (const [excelHeader, dbField] of Object.entries(fieldMapping)) {
      const index = headers.findIndex(
        h => h.toLowerCase().trim() === excelHeader.toLowerCase().trim()
      );
      if (index === -1) {
        results.errors.push(`Missing required column: ${excelHeader}`);
      } else {
        headerMap[excelHeader] = { index, field: dbField };
      }
    }
    
    if (results.errors.length > 0) {
      return res.json(results);
    }
    
    // 处理数据行
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 跳过表头
      
      try {
        const rowData = {};
        
        // 映射数据
        for (const [excelHeader, { index, field }] of Object.entries(headerMap)) {
          const cell = row.getCell(index + 1);
          let value = cell.value;
          
          if (value === null || value === undefined || value === '') {
            rowData[field] = null;
          } else if (field === 'TXDate') {
            // 处理日期
            if (value instanceof Date) {
              rowData[field] = value.toISOString().split('T')[0];
            } else {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                rowData[field] = date.toISOString().split('T')[0];
              } else {
                rowData[field] = String(value).trim() || null;
              }
            }
          } else if (['TXQty', 'TXP1', 'Unit Cost', 'Value'].includes(field)) {
            // 处理数字
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            rowData[field] = isNaN(numValue) ? null : numValue;
          } else {
            // 处理文本
            rowData[field] = String(value).trim() || null;
          }
        }
        
        // 验证必填字段
        if (!rowData.TXNo || !String(rowData.TXNo).trim()) {
          results.errors.push(`Row ${rowNumber}: Transaction Number (TXNo) is required`);
          results.failed++;
          return;
        }
        
        // 保存到数据库
        // 这里需要根据你的数据库实现进行调整
        // await db.sales_data.insertOne(rowData);
        // 或
        // await db.sales_data.updateOne(
        //   { TXNo: rowData.TXNo },
        //   { $set: rowData },
        //   { upsert: true }
        // );
        
        results.success++;
      } catch (error) {
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
        results.failed++;
      }
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to process file',
      error: error.message
    });
  }
});
```

---

## 注意事项

1. **字段名映射**：注意数据库字段名可能与 API 字段名不同（如 `Product Hierarchy 3` 在数据库中可能是 `Product_Hierarchy_3` 或 `ProductHierarchy3`）

2. **数据类型**：确保数字字段正确转换为数字类型，日期字段正确解析

3. **事务处理**：批量导入时建议使用数据库事务，确保数据一致性

4. **性能优化**：对于大量数据，考虑分批处理或使用批量插入操作

5. **错误处理**：提供详细的错误信息，帮助用户定位问题

6. **数据验证**：在插入数据库前进行充分的数据验证

7. **唯一性约束**：如果 `TXNo` 是唯一标识，需要处理重复数据的情况

8. **文件大小限制**：建议限制上传文件的大小（如最大 10MB）

9. **文件类型验证**：确保只接受 `.xlsx` 和 `.xls` 格式的文件

---

## 更新日志

- **2024-01-XX**: 添加 Excel 模板下载和批量导入接口
- **2024-01-XX**: 初始版本，包含基础 CRUD 接口

