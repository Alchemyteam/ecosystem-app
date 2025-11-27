# API 配置说明

## 环境变量配置

1. 在项目根目录创建 `.env.local` 文件（如果不存在）
2. 添加以下配置：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

对于生产环境，请使用你的实际 API 地址：
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 后端 API 要求

你的后端 API 需要实现以下端点：

### 1. 登录接口
- **URL**: `POST /api/auth/login`
- **请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **响应**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 2. 注册接口
- **URL**: `POST /api/auth/register`
- **请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name" // 可选
}
```
- **响应**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 3. 获取当前用户
- **URL**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name"
}
```

### 4. 验证 Token
- **URL**: `GET /api/auth/verify`
- **Headers**: `Authorization: Bearer {token}`
- **响应**:
```json
{
  "valid": true
}
```

## 错误响应格式

API 应该返回以下格式的错误：

```json
{
  "message": "错误信息",
  "errors": {
    "email": ["邮箱格式不正确"],
    "password": ["密码长度至少6个字符"]
  }
}
```

## Token 存储

- Token 存储在浏览器的 `localStorage` 中，key 为 `token`
- 所有需要认证的请求都会自动在 Header 中添加 `Authorization: Bearer {token}`

## 文件结构

- `services/api.ts` - API 服务层，包含所有 API 调用
- `contexts/AuthContext.tsx` - 认证上下文，管理用户状态
- `.env.local` - 环境变量配置文件（需要手动创建）

## 测试

在连接真实后端之前，你可以：

1. 使用模拟后端（如 JSON Server）
2. 使用 Postman 或类似工具测试 API
3. 检查浏览器控制台的网络请求和错误信息

