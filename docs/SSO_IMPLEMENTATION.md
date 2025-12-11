# Business Central SSO 集成实现方案

## 概述

本文档描述如何实现 Business Central (BC) 的单点登录 (SSO) 功能，允许用户使用 BC 账号密码登录本系统。

## 实现方案

### 方案 1: OAuth 2.0 / OpenID Connect (推荐)

Business Central 支持 OAuth 2.0 和 OpenID Connect，这是最标准的 SSO 实现方式。

#### 流程说明

1. 用户点击 "Login with Business Central" 按钮
2. 前端重定向到 BC 的授权服务器
3. 用户在 BC 登录页面输入账号密码
4. BC 授权服务器返回授权码 (Authorization Code)
5. 前端将授权码发送到后端
6. 后端用授权码换取访问令牌 (Access Token)
7. 后端验证令牌并创建/更新本地用户
8. 后端返回 JWT token 给前端
9. 前端存储 token，完成登录

### 方案 2: Azure AD 集成

如果 Business Central 使用 Azure AD，可以直接使用 Microsoft Identity Platform。

### 方案 3: 自定义 Token 验证

如果 BC 提供自定义的 API token，可以通过后端验证该 token。

## 技术实现

### 前端实现

1. 添加 SSO 登录按钮
2. 处理 OAuth 回调
3. 与后端 API 交换 token

### 后端实现

1. 配置 OAuth 客户端信息
2. 处理授权码交换
3. 验证 BC token
4. 同步用户信息
5. 生成本地 JWT token

## 配置要求

### Business Central 端配置

1. 在 BC 中注册应用 (Application Registration)
2. 获取 Client ID 和 Client Secret
3. 配置重定向 URI (Redirect URI)
4. 设置权限范围 (Scopes)

### 后端环境变量

```env
BC_CLIENT_ID=your_bc_client_id
BC_CLIENT_SECRET=your_bc_client_secret
BC_AUTHORIZATION_URL=https://api.businesscentral.dynamics.com/oauth2/authorize
BC_TOKEN_URL=https://api.businesscentral.dynamics.com/oauth2/token
BC_REDIRECT_URI=http://localhost:3000/auth/bc/callback
BC_API_BASE_URL=https://api.businesscentral.dynamics.com/v2.0
```

## 安全考虑

1. 使用 HTTPS
2. 安全存储 Client Secret
3. 验证 state 参数防止 CSRF
4. 使用 PKCE (Proof Key for Code Exchange) 增强安全性
5. Token 过期处理

