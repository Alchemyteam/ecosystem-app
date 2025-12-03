import { ChatRequest, ChatResponse } from '../types/chat';
import { getToken } from './api';

// 使用与 services/api.ts 相同的方式获取 API_BASE_URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * 发送聊天消息（物料搜索）
 * @param message 用户查询文本
 * @param conversationId 可选，会话ID
 * @param token 认证token（可选，如果不提供则从 localStorage 获取）
 * @returns 聊天响应
 */
export async function sendChatMessage(
  message: string,
  token?: string,
  conversationId?: string
): Promise<ChatResponse> {
  const url = `${API_BASE_URL}/chat/message`;
  
  // 获取 token（优先使用传入的 token，否则从 localStorage 获取）
  const authToken = token || getToken();
  
  if (!authToken) {
    throw new Error('未授权：请先登录');
  }
  
  const requestBody: ChatRequest = {
    message,
    ...(conversationId && { conversationId }),
  };
  
  console.log('=== Chat API Request ===');
  console.log('URL:', url);
  console.log('Message:', message);
  console.log('ConversationId:', conversationId);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    // 读取响应文本（只能读取一次）
    const responseText = await response.text();
    let errorMessage = `请求失败：${response.status} ${response.statusText}`;
    
    // 尝试解析 JSON 错误响应
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || errorData.error || errorMessage;
      if (errorData.errors) {
        const errorDetails = Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        errorMessage += ` (${errorDetails})`;
      }
      console.error('=== Chat API Error Response ===');
      console.error('Error data:', errorData);
    } catch (e) {
      if (responseText) {
        errorMessage += ` - ${responseText.substring(0, 200)}`;
      }
      console.error('=== Chat API Error (Non-JSON) ===');
      console.error('Response text:', responseText);
    }
    
    if (response.status === 401) {
      throw new Error('未授权：token 无效或已过期');
    }
    if (response.status === 500) {
      throw new Error('服务器错误：AI 服务暂时不可用，请稍后重试');
    }
    throw new Error(errorMessage);
  }
  
  const result = await response.json();
  console.log('=== Chat API Response ===');
  console.log('Response:', result);
  console.log('Has tableData:', !!result.tableData);
  console.log('Has actionData:', !!result.actionData);
  
  return result;
}

