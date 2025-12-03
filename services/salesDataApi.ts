import { SalesDataListResponse, SalesDataQueryParams } from '../types/salesData';
import { getToken } from './api';

// 使用与 services/api.ts 相同的方式获取 API_BASE_URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * 获取销售数据列表
 * @param params 查询参数
 * @param token 认证 token（可选，如果不提供则从 localStorage 获取）
 * @returns 销售数据列表响应
 */
export async function getSalesData(
  params: SalesDataQueryParams = {},
  token?: string
): Promise<SalesDataListResponse> {
  // 验证和规范化参数
  const page = Math.max(1, params.page || 1); // 确保 page >= 1
  const limit = Math.max(1, Math.min(100, params.limit || 20)); // 确保 limit 在 1-100 之间
  const sort = params.sort || 'newest';
  const category = params.category;
  const keyword = params.keyword;
  
  // 验证并规范化 sort 参数
  const validSorts: ('newest' | 'price_asc' | 'price_desc')[] = ['newest', 'price_asc', 'price_desc'];
  const normalizedSort = validSorts.includes(sort as any) ? sort : 'newest';
  
  if (sort !== normalizedSort) {
    console.warn(`不支持的 sort 值: ${sort}，已自动转换为: ${normalizedSort}`);
  }
  
  // 构建查询字符串 - 只传递 API 文档中定义的参数
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  queryParams.append('sort', normalizedSort);
  
  // 只有当 category 存在且不为 'all' 时才添加
  if (category && category !== 'all' && category.trim() !== '') {
    queryParams.append('category', category.trim());
  }
  
  // 添加 keyword 参数（如果存在）
  if (keyword && keyword.trim() !== '') {
    queryParams.append('keyword', keyword.trim());
  }
  
  // 添加筛选参数 - 根据 sales_data 表格结构
  // 交易相关
  if (params.minDate) queryParams.append('minDate', params.minDate);
  if (params.maxDate) queryParams.append('maxDate', params.maxDate);
  if (params.txNo && params.txNo.trim() !== '') queryParams.append('txNo', params.txNo.trim());
  if (params.minQty !== undefined) queryParams.append('minQty', params.minQty.toString());
  if (params.maxQty !== undefined) queryParams.append('maxQty', params.maxQty.toString());
  if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.minValue !== undefined) queryParams.append('minValue', params.minValue.toString());
  if (params.maxValue !== undefined) queryParams.append('maxValue', params.maxValue.toString());
  // 买家相关
  if (params.buyerCode && params.buyerCode.trim() !== '') queryParams.append('buyerCode', params.buyerCode.trim());
  if (params.buyerName && params.buyerName.trim() !== '') queryParams.append('buyerName', params.buyerName.trim());
  // 产品相关
  if (params.itemCode && params.itemCode.trim() !== '') queryParams.append('itemCode', params.itemCode.trim());
  if (params.itemName && params.itemName.trim() !== '') queryParams.append('itemName', params.itemName.trim());
  if (params.productHierarchy3 && params.productHierarchy3.trim() !== '') queryParams.append('productHierarchy3', params.productHierarchy3.trim());
  if (params.itemType && params.itemType.trim() !== '') queryParams.append('itemType', params.itemType.trim());
  if (params.model && params.model.trim() !== '') queryParams.append('model', params.model.trim());
  if (params.material && params.material.trim() !== '') queryParams.append('material', params.material.trim());
  if (params.uom && params.uom.trim() !== '') queryParams.append('uom', params.uom.trim());
  // 品牌和性能
  if (params.brandCode && params.brandCode.trim() !== '') queryParams.append('brandCode', params.brandCode.trim());
  if (params.performance && params.performance.trim() !== '') queryParams.append('performance', params.performance.trim());
  if (params.performance1 && params.performance1.trim() !== '') queryParams.append('performance1', params.performance1.trim());
  // 成本和功能
  if (params.minUnitCost !== undefined) queryParams.append('minUnitCost', params.minUnitCost.toString());
  if (params.maxUnitCost !== undefined) queryParams.append('maxUnitCost', params.maxUnitCost.toString());
  if (params.function && params.function.trim() !== '') queryParams.append('function', params.function.trim());
  // 行业相关
  if (params.sector && params.sector.trim() !== '') queryParams.append('sector', params.sector.trim());
  if (params.subSector && params.subSector.trim() !== '') queryParams.append('subSector', params.subSector.trim());
  // 其他
  if (params.source && params.source.trim() !== '') queryParams.append('source', params.source.trim());
  
  const url = `${API_BASE_URL}/buyer/sales-data?${queryParams.toString()}`;
  
  // 验证 URL 中只包含预期的参数
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const allowedParams = ['page', 'limit', 'sort', 'category', 'keyword', 'minDate', 'maxDate', 'txNo', 'minQty', 'maxQty', 'minPrice', 'maxPrice', 'minValue', 'maxValue', 'buyerCode', 'buyerName', 'itemCode', 'itemName', 'productHierarchy3', 'itemType', 'model', 'material', 'uom', 'brandCode', 'performance', 'performance1', 'minUnitCost', 'maxUnitCost', 'function', 'sector', 'subSector', 'source'];
  const unexpectedParams = Array.from(urlParams.keys()).filter(key => !allowedParams.includes(key));
  if (unexpectedParams.length > 0) {
    console.warn('警告：检测到意外的查询参数:', unexpectedParams);
  }
  
  // 获取 token（优先使用传入的 token，否则从 localStorage 获取）
  const authToken = token || getToken();
  
  if (!authToken) {
    throw new Error('未授权：请先登录');
  }
  
  console.log('=== API Request ===');
  console.log('URL:', url);
  console.log('Params:', { 
    page, 
    limit, 
    sort: normalizedSort, 
    category, 
    keyword,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    minDate: params.minDate,
    maxDate: params.maxDate,
    buyerName: params.buyerName,
    itemType: params.itemType,
    material: params.material,
    brandCode: params.brandCode,
    sector: params.sector,
    subSector: params.subSector,
    function: params.function,
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    // 读取响应文本（只能读取一次）
    const responseText = await response.text();
    let errorMessage = `请求失败：${response.status} ${response.statusText}`;
    
    // 尝试解析 JSON 错误响应
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || errorData.error || errorMessage;
      // 如果有详细的错误信息，添加到消息中
      if (errorData.errors) {
        const errorDetails = Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        errorMessage += ` (${errorDetails})`;
      }
      console.error('=== API Error Response ===');
      console.error('Error data:', errorData);
    } catch (e) {
      // 如果无法解析 JSON，使用原始响应文本
      if (responseText) {
        errorMessage += ` - ${responseText.substring(0, 200)}`;
      }
      console.error('=== API Error (Non-JSON) ===');
      console.error('Response text:', responseText);
    }
    
    if (response.status === 401) {
      throw new Error('未授权：token 无效或已过期');
    }
    if (response.status === 400) {
      // 检查是否是数据库列名错误
      if (errorMessage.includes('buyer_code') || errorMessage.includes('Column') || errorMessage.includes('not found')) {
        throw new Error(`后端数据库错误：${errorMessage}\n\n这通常是后端代码问题，请检查后端是否正确使用了数据库列名（应该是 BuyerCode 而不是 buyer_code）`);
      }
      throw new Error(`请求参数错误：${errorMessage}`);
    }
    if (response.status === 500) {
      throw new Error('服务器错误：数据库连接失败');
    }
    throw new Error(errorMessage);
  }
  
  return await response.json();
}

