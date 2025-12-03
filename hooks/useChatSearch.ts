import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/chatApi';
import { ChatResponse } from '../types/chat';
import { getToken } from '../services/api';

interface UseChatSearchReturn {
  sendMessage: (message: string) => Promise<void>;
  response: ChatResponse | null;
  loading: boolean;
  error: string | null;
  conversationId: string | null;
  clearConversation: () => void;
}

export function useChatSearch(token?: string): UseChatSearchReturn {
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const sendMessage = useCallback(async (message: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取 token（优先使用传入的 token，否则从 localStorage 获取）
      const authToken = token || getToken();
      if (!authToken) {
        throw new Error('未授权：请先登录');
      }
      
      const result = await sendChatMessage(message, authToken, conversationId || undefined);
      
      setResponse(result);
      if (result.conversationId) {
        setConversationId(result.conversationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [token, conversationId]);
  
  const clearConversation = useCallback(() => {
    setConversationId(null);
    setResponse(null);
    setError(null);
  }, []);
  
  return {
    sendMessage,
    response,
    loading,
    error,
    conversationId,
    clearConversation,
  };
}

