# 前端 API 接口规范文档

## 基础配置

- **基础URL**: 通过环境变量 `VITE_API_BASE_URL` 配置，默认为 `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **Token 存储**: 浏览器 `localStorage`，key 为 `token`
- **Token 使用**: 所有需要认证的请求在 Header 中添加 `Authorization: Bearer {token}`

---

## 接口列表

### 1. 用户登录

**接口地址**: `POST /api/auth/login`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**成功响应** (HTTP 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**失败响应** (HTTP 400/401):
```json
{
  "message": "Invalid email or password",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password is required"]
  }
}
```

---

### 2. 用户注册

**接口地址**: `POST /api/auth/register`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**注意**: `name` 字段是可选的

**成功响应** (HTTP 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "message": "Registration failed",
  "errors": {
    "email": ["Email already exists", "Email format is invalid"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

---

### 3. 获取当前用户信息

**接口地址**: `GET /api/auth/me`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**: 无

**成功响应** (HTTP 200):
```json
{
  "id": "user_id_123",
  "email": "user@example.com",
  "name": "User Name"
}
```

**失败响应** (HTTP 401):
```json
{
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

---

### 4. 验证 Token

**接口地址**: `GET /api/auth/verify`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**: 无

**成功响应** (HTTP 200):
```json
{
  "valid": true
}
```

**失败响应** (HTTP 401):
```json
{
  "message": "Token is invalid or expired"
}
```

或者返回:
```json
{
  "valid": false
}
```

---

## 错误处理规范

### 标准错误响应格式

所有错误响应都应该遵循以下格式：

```json
{
  "message": "主要错误信息",
  "errors": {
    "field_name": ["错误信息1", "错误信息2"]
  }
}
```

### HTTP 状态码

- **200**: 请求成功
- **400**: 请求参数错误（如验证失败）
- **401**: 未授权（token 无效或过期）
- **404**: 资源不存在
- **500**: 服务器内部错误

### 错误示例

**验证错误** (HTTP 400):
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email format is invalid"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

**认证错误** (HTTP 401):
```json
{
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

---

## Token 使用说明

1. **Token 获取**: 登录和注册成功后，响应中的 `token` 字段会被前端自动存储
2. **Token 发送**: 所有需要认证的请求会自动在 Header 中添加 `Authorization: Bearer {token}`
3. **Token 验证**: 页面刷新时，前端会调用 `/api/auth/verify` 验证 token 是否有效
4. **Token 清除**: 用户登出时，前端会清除 localStorage 中的 token

---

## 完整请求示例

### 登录请求示例

```http
POST /api/auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 获取用户信息请求示例

```http
GET /api/auth/me HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 前端调用流程

1. **登录流程**:
   - 用户输入邮箱和密码
   - 调用 `POST /api/auth/login`
   - 成功后保存 token 和用户信息
   - 跳转到首页

2. **注册流程**:
   - 用户输入邮箱、密码、姓名（可选）
   - 调用 `POST /api/auth/register`
   - 成功后保存 token 和用户信息
   - 跳转到首页

3. **页面加载流程**:
   - 检查 localStorage 中是否有 token
   - 如果有，调用 `GET /api/auth/verify` 验证 token
   - 如果有效，调用 `GET /api/auth/me` 获取用户信息
   - 如果无效，清除 token 并跳转到登录页

4. **登出流程**:
   - 清除 localStorage 中的 token
   - 清除用户状态
   - 跳转到登录页

---

## 注意事项

1. **CORS**: 后端需要配置 CORS，允许前端域名访问
2. **Token 过期**: 建议 token 有过期时间，前端会在验证时检查
3. **密码安全**: 前端不会存储密码，只存储 token
4. **错误处理**: 前端会显示后端返回的 `message` 或 `errors` 中的错误信息

---

## 测试建议

1. 使用 Postman 或类似工具测试每个接口
2. 确保所有接口都返回正确的状态码
3. 测试错误情况（无效邮箱、密码太短、token 过期等）
4. 检查 CORS 配置是否正确

