// 销售数据项类型
export interface SalesData {
  id?: number | string;                 // 数据库主键ID（推荐使用）
  TXDate: string | null;              // 交易日期 "2024-01-20"
  TXNo: string | null;                 // 交易编号
  TXQty: number | null;                // 交易数量
  TXP1: number | null;                  // 交易价格
  BuyerCode: string | null;            // 买家代码
  BuyerName: string | null;             // 买家名称
  ItemCode: string | null;              // 产品代码
  ItemName: string | null;              // 产品名称
  "Product Hierarchy 3": string | null; // 产品分类层级3
  Function: string | null;              // 功能
  ItemType: string | null;              // 产品类型
  Model: string | null;                 // 型号
  Performance: string | null;           // 性能
  "Performance.1": string | null;       // 性能1
  Material: string | null;              // 材料
  UOM: string | null;                   // 单位
  "Brand Code": string | null;          // 品牌代码
  "Unit Cost": number | null;           // 单位成本
  Sector: string | null;                // 行业
  SubSector: string | null;             // 子行业
  Value: number | null;                 // 总价值
  Rationale: string | null;            // 理由
  www: string | null;                   // 网址
  Source: string | null;                // 来源
}

// 分页信息类型
export interface Pagination {
  page: number;        // 当前页码
  limit: number;       // 每页数量
  total: number;       // 总记录数
  totalPages: number;  // 总页数
}

// 销售数据列表响应类型
export interface SalesDataListResponse {
  data: SalesData[];
  pagination: Pagination;
}

// 查询参数类型 - 根据 sales_data 表格结构
export interface SalesDataQueryParams {
  page?: number;      // 页码，从1开始，默认1
  limit?: number;     // 每页数量，默认20
  sort?: 'newest' | 'price_asc' | 'price_desc';  // 排序方式，默认newest
  category?: string;  // 产品分类过滤（当值为'all'时不传此参数）
  keyword?: string;   // 搜索关键词（可选）
  // 交易相关
  minDate?: string;   // TXDate 最早日期
  maxDate?: string;   // TXDate 最晚日期
  txNo?: string;      // TXNo 交易编号
  minQty?: number;    // TXQty 最小数量
  maxQty?: number;    // TXQty 最大数量
  minPrice?: number;  // TXP1 最低价格
  maxPrice?: number;  // TXP1 最高价格
  minValue?: number;  // Value 最小总价值
  maxValue?: number;  // Value 最大总价值
  // 买家相关
  buyerCode?: string; // BuyerCode 买家代码
  buyerName?: string; // BuyerName 买家名称
  // 产品相关
  itemCode?: string;  // ItemCode 产品代码
  itemName?: string;  // ItemName 产品名称
  productHierarchy3?: string; // Product Hierarchy 3 产品分类层级3
  itemType?: string;  // ItemType 产品类型
  model?: string;     // Model 型号
  material?: string;  // Material 材料
  uom?: string;       // UOM 单位
  // 品牌和性能
  brandCode?: string; // Brand Code 品牌代码
  performance?: string; // Performance 性能
  performance1?: string; // Performance.1 性能1
  // 成本和功能
  minUnitCost?: number; // Unit Cost 最小单位成本
  maxUnitCost?: number; // Unit Cost 最大单位成本
  function?: string;  // Function 功能
  // 行业相关
  sector?: string;    // Sector 行业
  subSector?: string; // SubSector 子行业
  // 其他
  source?: string;    // Source 来源
}

