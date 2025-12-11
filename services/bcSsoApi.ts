/**
 * Business Central SSO API
 * 处理与 Business Central 的 OAuth 2.0 集成
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Business Central OAuth 配置
const BC_CLIENT_ID = import.meta.env.VITE_BC_CLIENT_ID || '';
const BC_AUTHORIZATION_URL = import.meta.env.VITE_BC_AUTHORIZATION_URL || 
  'https://api.businesscentral.dynamics.com/oauth2/authorize';
const BC_REDIRECT_URI = import.meta.env.VITE_BC_REDIRECT_URI || 
  `${window.location.origin}/auth/bc/callback`;

// 生成随机 state 用于 CSRF 防护
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// 生成 PKCE code verifier 和 challenge
async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateState() + generateState();
  
  // 将 codeVerifier 转换为 SHA256 hash，然后 base64url 编码
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return {
    codeVerifier,
    codeChallenge: base64,
  };
}

export interface BCAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    bcUserId?: string;
  };
}

export interface BCAuthError {
  message: string;
  error?: string;
}

/**
 * 启动 Business Central OAuth 登录流程
 * 重定向用户到 BC 授权页面
 */
export async function initiateBCLogin(): Promise<void> {
  if (!BC_CLIENT_ID) {
    throw new Error('Business Central Client ID is not configured');
  }

  // 生成 state 和 PKCE
  const state = generateState();
  const { codeVerifier, codeChallenge } = await generatePKCE();
  
  // 存储 state 和 codeVerifier 到 sessionStorage（用于回调时验证）
  sessionStorage.setItem('bc_oauth_state', state);
  sessionStorage.setItem('bc_code_verifier', codeVerifier);
  
  // 构建授权 URL
  const params = new URLSearchParams({
    client_id: BC_CLIENT_ID,
    response_type: 'code',
    redirect_uri: BC_REDIRECT_URI,
    scope: 'openid profile email offline_access', // 根据需要调整 scope
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  const authUrl = `${BC_AUTHORIZATION_URL}?${params.toString()}`;
  
  // 重定向到 BC 授权页面
  window.location.href = authUrl;
}

/**
 * 处理 OAuth 回调
 * 从 URL 中提取授权码，发送到后端交换 token
 */
export async function handleBCCallback(
  code: string,
  state: string
): Promise<BCAuthResponse> {
  // 验证 state
  const savedState = sessionStorage.getItem('bc_oauth_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter. Possible CSRF attack.');
  }
  
  // 获取 code verifier
  const codeVerifier = sessionStorage.getItem('bc_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }
  
  // 清理 sessionStorage
  sessionStorage.removeItem('bc_oauth_state');
  sessionStorage.removeItem('bc_code_verifier');
  
  // 发送授权码到后端
  const response = await fetch(`${API_BASE_URL}/auth/bc/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      state,
      code_verifier: codeVerifier,
      redirect_uri: BC_REDIRECT_URI,
    }),
  });
  
  if (!response.ok) {
    const error: BCAuthError = await response.json();
    throw new Error(error.message || 'Failed to authenticate with Business Central');
  }
  
  const data: BCAuthResponse = await response.json();
  
  // 存储 token
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  return data;
}

/**
 * 检查 URL 中是否有 OAuth 回调参数
 */
export function checkBCCallback(): { code: string; state: string } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (code && state) {
    return { code, state };
  }
  
  return null;
}

