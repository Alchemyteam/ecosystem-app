# 路由跳转逻辑总结

## 产品详情页面路由

**路由路径**: `/buyer/products/:productId`

**路由配置**: `routes/index.tsx` 第 109-115 行

```typescript
<Route
  path="/buyer/products/:productId"
  element={
    <ProtectedRoute>
      <ProductDetailPage />
    </ProtectedRoute>
  }
/>
```

---

## 1. ProductsListPage（产品列表页面）

### 1.1 卡片视图（Card View）

**位置**: `pages/ProductsListPage.tsx` 第 927-946 行

**跳转逻辑**:
```typescript
onClick={() => {
  // 优先级：id > ItemCode > TXNo
  let productId: string | null = null;
  
  if (product.id !== null && product.id !== undefined && product.id !== '') {
    productId = String(product.id);  // 最优先：使用 id（数据库主键）
  } else if (product.ItemCode) {
    productId = String(product.ItemCode);  // 其次：使用 ItemCode
  } else if (product.TXNo) {
    productId = String(product.TXNo);  // 最后：使用 TXNo
  }
  
  if (productId) {
    console.log('Navigating to product detail with ID:', productId, 'from product:', { 
      id: product.id, 
      ItemCode: product.ItemCode, 
      TXNo: product.TXNo 
    });
    navigate(`/buyer/products/${productId}`);
  }
}}
```

**特点**:
- ✅ 使用严格的 `if-else` 检查，不使用 `||` 运算符
- ✅ 即使 `id` 是 `0` 也会被正确使用
- ✅ 包含调试日志，方便排查问题
- ✅ 按钮禁用条件：`!product.id && !product.ItemCode && !product.TXNo`

### 1.2 表格视图（Table View）

**位置**: `pages/ProductsListPage.tsx` 第 1095-1112 行

**跳转逻辑**:
```typescript
onClick={() => {
  // 优先级：id > ItemCode > TXNo
  let productId: string | null = null;
  
  if (product.id !== null && product.id !== undefined && product.id !== '') {
    productId = String(product.id);  // 最优先：使用 id（数据库主键）
  } else if (product.ItemCode) {
    productId = String(product.ItemCode);  // 其次：使用 ItemCode
  } else if (product.TXNo) {
    productId = String(product.TXNo);  // 最后：使用 TXNo
  }
  
  if (productId) {
    console.log('Navigating to product detail with ID:', productId, 'from product:', { 
      id: product.id, 
      ItemCode: product.ItemCode, 
      TXNo: product.TXNo 
    });
    navigate(`/buyer/products/${productId}`);
  }
}}
```

**特点**:
- ✅ 与卡片视图逻辑完全一致
- ✅ 包含调试日志
- ✅ 按钮禁用条件：`!product.id && !product.ItemCode && !product.TXNo`

---

## 2. AISearchPage（AI搜索页面）

**位置**: `pages/AISearchPage.tsx` 第 499-560 行

**跳转逻辑**:
```typescript
// 提取产品ID的函数
const getProductId = (row: Record<string, any>): string | null => {
  // 最优先字段：id（数据库主键，推荐使用）
  const idFields = ['id', 'ID', 'Id'];
  for (const field of idFields) {
    const value = row[field];
    // 严格检查：id 不为 null/undefined/空字符串，包括数字 0
    if (value !== null && value !== undefined && value !== '') {
      // id 可以是数字或字符串，都接受（包括纯数字）
      return String(value).trim();
    }
  }
  
  // 次优字段：ItemCode（产品代码）
  const itemCodeFields = [
    'ItemCode', 'itemCode', 'item_code', 'Item Code', 'ITEM_CODE'
  ];
  for (const field of itemCodeFields) {
    const value = row[field];
    if (value && String(value).trim()) {
      const id = String(value).trim();
      // ItemCode 接受任何格式（包括纯数字）
      return id;
    }
  }
  
  // 最后尝试：TXNo（交易编号）
  const txNoFields = ['TXNo', 'txNo', 'tx_no', 'TX_NO'];
  for (const field of txNoFields) {
    const value = row[field];
    if (value && String(value).trim()) {
      const id = String(value).trim();
      // TXNo 也接受任何格式
      return id;
    }
  }
  
  return null;
};

// 使用提取的 productId
const productId = getProductId(row);

// 跳转
<button
  onClick={() => navigate(`/buyer/products/${productId}`)}
  className="..."
>
  View Details
</button>
```

**特点**:
- ✅ 支持多种字段名变体（大小写、下划线等）
- ✅ 优先级：`id` > `ItemCode` > `TXNo`
- ✅ 接受数字格式的 `id`（包括纯数字）
- ✅ 如果没有找到任何ID，按钮不显示或显示 "-"

---

## 3. 产品ID优先级总结

### 优先级顺序（从高到低）

1. **`id`**（数据库主键）
   - 检查条件：`value !== null && value !== undefined && value !== ''`
   - 接受格式：数字（如 `1234`）或字符串（如 `"1234"`）
   - 包括 `0` 也会被接受

2. **`ItemCode`**（产品代码）
   - 检查条件：`value && String(value).trim()`
   - 接受格式：任何非空字符串（如 `"TI00040"`）

3. **`TXNo`**（交易编号）
   - 检查条件：`value && String(value).trim()`
   - 接受格式：任何非空字符串

---

## 4. 路由跳转流程

```
用户点击 "View Details" 按钮
    ↓
检查产品数据中的 id 字段
    ↓
如果 id 存在且有效 → 使用 id
    ↓
如果 id 不存在 → 检查 ItemCode
    ↓
如果 ItemCode 存在 → 使用 ItemCode
    ↓
如果 ItemCode 不存在 → 检查 TXNo
    ↓
如果 TXNo 存在 → 使用 TXNo
    ↓
跳转到: /buyer/products/{productId}
    ↓
ProductDetailPage 组件接收 productId 参数
    ↓
调用 API: GET /api/buyer/products/{productId}
    ↓
显示产品详情
```

---

## 5. 调试信息

### ProductsListPage
- 点击 "View Details" 时会在控制台输出：
  ```javascript
  console.log('Navigating to product detail with ID:', productId, 'from product:', { 
    id: product.id, 
    ItemCode: product.ItemCode, 
    TXNo: product.TXNo 
  });
  ```

### AISearchPage
- 没有调试日志，但可以通过浏览器开发者工具查看网络请求

---

## 6. 常见问题排查

### 问题1：仍然使用 ItemCode 而不是 id

**可能原因**:
1. 后端返回的数据中没有 `id` 字段
2. `id` 字段值为 `null` 或 `undefined`
3. 后端查询未包含 `id` 列

**解决方法**:
1. 检查浏览器控制台的调试日志，查看 `product.id` 的值
2. 检查后端 API 响应，确认是否包含 `id` 字段
3. 参考 `BACKEND_ID_COLUMN_FIX.md` 修复后端代码

### 问题2：路由跳转失败

**可能原因**:
1. `productId` 为 `null` 或空字符串
2. 路由配置错误
3. 产品ID格式不正确

**解决方法**:
1. 检查控制台是否有错误信息
2. 确认路由配置正确（`/buyer/products/:productId`）
3. 检查 `productId` 的值是否符合后端要求

---

## 7. 代码位置索引

| 功能 | 文件 | 行号 |
|------|------|------|
| 路由配置 | `routes/index.tsx` | 109-115 |
| 卡片视图跳转 | `pages/ProductsListPage.tsx` | 927-946 |
| 表格视图跳转 | `pages/ProductsListPage.tsx` | 1095-1112 |
| AI搜索跳转 | `pages/AISearchPage.tsx` | 499-560 |
| 产品详情页面 | `pages/ProductDetailPage.tsx` | - |

---

## 8. 最佳实践

1. **优先使用 `id`**：数据库主键，性能更好，更标准
2. **向后兼容**：支持 `ItemCode` 和 `TXNo`，确保旧数据也能正常工作
3. **严格检查**：不使用 `||` 运算符，避免 `0` 值被跳过
4. **调试友好**：添加日志，方便排查问题
5. **错误处理**：按钮禁用条件确保不会跳转到无效路由

