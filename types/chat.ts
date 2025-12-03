// 聊天请求
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

// 聊天响应
export interface ChatResponse {
  response: string;
  conversationId: string;
  tableData?: TableData;
  actionData?: ActionData;
}

// 表格数据
export interface TableData {
  title: string;
  headers: string[];
  rows: Array<Record<string, any>>;
  description?: string;
}

// 操作数据
export interface ActionData {
  actionType: string;
  parameters: Record<string, any>;
  message?: string;
}

