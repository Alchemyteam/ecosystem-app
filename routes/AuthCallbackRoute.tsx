/**
 * OAuth 回调路由组件
 * 处理 Business Central OAuth 回调
 */
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleBCCallback } from '../services/bcSsoApi';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      // OAuth 错误（用户取消授权等）
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_cancelled');
      return;
    }

    if (code && state) {
      // 处理 OAuth 回调
      handleBCCallback(code, state)
        .then((response) => {
          // 更新用户状态
          setUser(response.user);
          // 登录成功，重定向到首页
          navigate('/');
        })
        .catch((err) => {
          console.error('BC callback error:', err);
          navigate(`/login?error=${encodeURIComponent(err.message)}`);
        });
    } else {
      // 缺少必要参数
      navigate('/login?error=invalid_callback');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Completing login...</p>
      </div>
    </div>
  );
};

export default AuthCallbackRoute;

