import { useState, useEffect } from 'react';
import { getSalesData } from '../services/salesDataApi';
import { SalesDataListResponse, SalesDataQueryParams } from '../types/salesData';
import { getToken } from '../services/api';

interface UseSalesDataReturn {
  data: SalesDataListResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSalesData(
  params: SalesDataQueryParams,
  token?: string
): UseSalesDataReturn {
  const [data, setData] = useState<SalesDataListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // 如果没有传入 token，则从 localStorage 获取
      const authToken = token || getToken();
      if (!authToken) {
        throw new Error('未授权：请先登录');
      }
      const result = await getSalesData(params, authToken);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.sort, params.category]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

