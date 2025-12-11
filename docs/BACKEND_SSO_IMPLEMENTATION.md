# 后端 SSO 实现指南

## 概述

本文档描述后端如何实现 Business Central SSO 集成。

## 需要的后端 API 端点

### 1. OAuth 回调处理端点

**POST** `/api/auth/bc/callback`

处理来自前端的授权码，与 Business Central 交换 token，并创建/更新本地用户。

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

## 实现步骤（Python FastAPI 示例）

### 1. 安装依赖

```bash
pip install httpx python-jose[cryptography] passlib[bcrypt]
```

### 2. 环境变量配置

```env
BC_CLIENT_ID=your_bc_client_id
BC_CLIENT_SECRET=your_bc_client_secret
BC_TOKEN_URL=https://api.businesscentral.dynamics.com/oauth2/token
BC_API_BASE_URL=https://api.businesscentral.dynamics.com/v2.0
JWT_SECRET_KEY=your_jwt_secret_key
```

### 3. 后端代码示例

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()

# 配置
BC_CLIENT_ID = os.getenv("BC_CLIENT_ID")
BC_CLIENT_SECRET = os.getenv("BC_CLIENT_SECRET")
BC_TOKEN_URL = os.getenv("BC_TOKEN_URL")
BC_API_BASE_URL = os.getenv("BC_API_BASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"

class BCCallbackRequest(BaseModel):
    code: str
    state: str
    code_verifier: str
    redirect_uri: str

@router.post("/auth/bc/callback")
async def bc_callback(request: BCCallbackRequest):
    """
    处理 Business Central OAuth 回调
    """
    try:
        # 1. 用授权码和 code_verifier 换取 access token
        token_data = {
            "grant_type": "authorization_code",
            "client_id": BC_CLIENT_ID,
            "client_secret": BC_CLIENT_SECRET,
            "code": request.code,
            "redirect_uri": request.redirect_uri,
            "code_verifier": request.code_verifier,
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                BC_TOKEN_URL,
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to exchange authorization code for token"
                )
            
            bc_tokens = token_response.json()
            access_token = bc_tokens.get("access_token")
            id_token = bc_tokens.get("id_token")
        
        # 2. 验证并解析 ID token（如果使用 OpenID Connect）
        if id_token:
            # 验证 JWT token（需要 BC 的公钥）
            # 这里简化处理，实际应该验证签名
            decoded_token = jwt.decode(
                id_token,
                options={"verify_signature": False}  # 生产环境需要验证
            )
            bc_user_id = decoded_token.get("sub")
            email = decoded_token.get("email")
            name = decoded_token.get("name")
        else:
            # 如果没有 ID token，使用 access token 调用 BC API 获取用户信息
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    f"{BC_API_BASE_URL}/users",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    bc_user_id = user_data.get("id")
                    email = user_data.get("email")
                    name = user_data.get("displayName")
        
        # 3. 在本地数据库中查找或创建用户
        # 这里需要根据你的数据库模型实现
        user = await get_or_create_user(
            email=email,
            name=name,
            bc_user_id=bc_user_id,
            bc_access_token=access_token  # 可选：存储用于后续 API 调用
        )
        
        # 4. 生成本地 JWT token
        jwt_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        return {
            "token": jwt_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "bcUserId": bc_user_id
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Authentication failed: {str(e)}"
        )

def create_access_token(data: dict, expires_delta: timedelta = None):
    """创建 JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_or_create_user(email: str, name: str, bc_user_id: str, bc_access_token: str):
    """
    在数据库中查找或创建用户
    需要根据你的数据库模型实现
    """
    # 伪代码示例
    # user = await db.users.find_one({"email": email})
    # if not user:
    #     user = await db.users.insert_one({
    #         "email": email,
    #         "name": name,
    #         "bc_user_id": bc_user_id,
    #         "bc_access_token": bc_access_token,
    #         "created_at": datetime.utcnow()
    #     })
    # else:
    #     # 更新 BC 相关信息
    #     await db.users.update_one(
    #         {"email": email},
    #         {"$set": {
    #             "bc_user_id": bc_user_id,
    #             "bc_access_token": bc_access_token,
    #             "updated_at": datetime.utcnow()
    #         }}
    #     )
    # return user
    pass
```

## 安全最佳实践

1. **验证 state 参数**：防止 CSRF 攻击
2. **使用 PKCE**：增强 OAuth 流程安全性
3. **验证 token 签名**：在生产环境中验证 ID token 的签名
4. **安全存储密钥**：使用环境变量或密钥管理服务
5. **Token 刷新**：实现 refresh token 机制
6. **HTTPS**：所有通信使用 HTTPS

## 测试

1. 配置环境变量
2. 启动后端服务
3. 在前端点击 "Login with Business Central"
4. 完成 BC 登录流程
5. 验证回调是否成功处理

## 故障排查

- 检查 Client ID 和 Secret 是否正确
- 验证 Redirect URI 是否匹配
- 检查 BC API 权限和范围
- 查看后端日志获取详细错误信息

