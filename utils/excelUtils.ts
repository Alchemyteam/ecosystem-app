/**
 * Excel 工具函数
 * 用于生成 Excel 模板和解析上传的 Excel 文件
 */

import * as XLSX from 'xlsx';

// SalesData 字段列表（与表单中的字段顺序一致）
export const SALES_DATA_COLUMNS = [
  'TXDate',
  'TXNo',
  'TXQty',
  'TXP1',
  'BuyerCode',
  'BuyerName',
  'ItemCode',
  'ItemName',
  'Product Hierarchy 3',
  'ItemType',
  'Model',
  'Material',
  'UOM',
  'Brand Code',
  'Unit Cost',
  'Sector',
  'SubSector',
  'Value',
  'Function',
  'Performance',
  'Performance.1',
  'Rationale',
  'www',
  'Source',
];

// 字段的中文/友好名称（用于 Excel 表头）
export const SALES_DATA_COLUMN_NAMES: Record<string, string> = {
  'TXDate': 'Transaction Date',
  'TXNo': 'Transaction Number',
  'TXQty': 'Transaction Quantity',
  'TXP1': 'Transaction Price',
  'BuyerCode': 'Buyer Code',
  'BuyerName': 'Buyer Name',
  'ItemCode': 'Item Code',
  'ItemName': 'Item Name',
  'Product Hierarchy 3': 'Product Hierarchy 3',
  'ItemType': 'Item Type',
  'Model': 'Model',
  'Material': 'Material',
  'UOM': 'Unit of Measure',
  'Brand Code': 'Brand Code',
  'Unit Cost': 'Unit Cost',
  'Sector': 'Sector',
  'SubSector': 'Sub Sector',
  'Value': 'Value',
  'Function': 'Function',
  'Performance': 'Performance',
  'Performance.1': 'Performance.1',
  'Rationale': 'Rationale',
  'www': 'Website',
  'Source': 'Source',
};

/**
 * 生成 Excel 模板文件
 * 包含表头和一个示例行
 */
export function generateExcelTemplate(): void {
  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 创建表头数据
  const headers = SALES_DATA_COLUMNS.map((col) => SALES_DATA_COLUMN_NAMES[col] || col);
  
  // 创建示例数据行（所有字段为空，除了 TXNo 作为必填字段的示例）
  const exampleRow: any[] = SALES_DATA_COLUMNS.map((col) => {
    if (col === 'TXNo') {
      return 'TXN-2024-001'; // 示例交易编号
    }
    return ''; // 其他字段为空
  });

  // 创建工作表数据
  const worksheetData = [
    headers, // 第一行：表头
    exampleRow, // 第二行：示例数据
  ];

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 设置列宽（可选，让 Excel 更易读）
  const colWidths = SALES_DATA_COLUMNS.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data Template');

  // 生成 Excel 文件并下载
  const fileName = `Sales_Data_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 解析上传的 Excel 文件
 * @param file Excel 文件
 * @returns 解析后的数据数组和错误信息
 */
export async function parseExcelFile(
  file: File
): Promise<{
  data: any[];
  errors: string[];
}> {
  const errors: string[] = [];
  const data: any[] = [];

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        if (!fileData) {
          reject(new Error('Failed to read file'));
          return;
        }

        // 读取 Excel 文件
        const workbook = XLSX.read(fileData, { type: 'binary' });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 将工作表转换为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // 使用数组格式，第一行是表头
          defval: null, // 空单元格返回 null
        });

        if (jsonData.length < 2) {
          errors.push('Excel file must contain at least a header row and one data row');
          resolve({ data: [], errors });
          return;
        }

        // 第一行是表头
        const headers = (jsonData[0] as any[]).map((h: any) => 
          String(h || '').trim()
        );

        // 验证表头
        const expectedHeaders = SALES_DATA_COLUMNS.map((col) => 
          SALES_DATA_COLUMN_NAMES[col] || col
        );

        const headerMap: Record<string, string> = {};
        expectedHeaders.forEach((expectedHeader, index) => {
          const foundIndex = headers.findIndex(
            (h) => h.toLowerCase().trim() === expectedHeader.toLowerCase().trim()
          );
          if (foundIndex !== -1) {
            // 使用实际 Excel 表头作为 key，而不是 expectedHeader
            headerMap[headers[foundIndex]] = SALES_DATA_COLUMNS[index];
          } else {
            errors.push(`Missing required column: ${expectedHeader}`);
          }
        });

        if (errors.length > 0) {
          resolve({ data: [], errors });
          return;
        }

        // 解析数据行（从第二行开始）
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue; // 跳过空行

          // 检查是否整行都为空
          const isEmptyRow = row.every((cell) => !cell || String(cell).trim() === '');
          if (isEmptyRow) continue;

          const rowData: any = {};

          // 映射数据
          headers.forEach((header, colIndex) => {
            const fieldName = headerMap[header];
            if (fieldName) {
              const cellValue = row[colIndex];
              
              // 处理不同类型的值
              if (cellValue === null || cellValue === undefined || cellValue === '') {
                rowData[fieldName] = null;
              } else if (fieldName === 'TXNo') {
                // 处理 TXNo - 确保转换为字符串并去除空格
                const txNoValue = String(cellValue).trim();
                rowData[fieldName] = txNoValue || null;
              } else if (fieldName === 'TXDate') {
                // 处理日期
                if (cellValue instanceof Date) {
                  rowData[fieldName] = cellValue.toISOString().split('T')[0];
                } else {
                  // 尝试解析日期字符串
                  const date = new Date(cellValue);
                  if (!isNaN(date.getTime())) {
                    rowData[fieldName] = date.toISOString().split('T')[0];
                  } else {
                    rowData[fieldName] = String(cellValue).trim() || null;
                  }
                }
              } else if (
                fieldName === 'TXQty' ||
                fieldName === 'TXP1' ||
                fieldName === 'Unit Cost' ||
                fieldName === 'Value'
              ) {
                // 处理数字字段
                const numValue = typeof cellValue === 'number' 
                  ? cellValue 
                  : parseFloat(String(cellValue));
                rowData[fieldName] = isNaN(numValue) ? null : numValue;
              } else {
                // 处理文本字段
                rowData[fieldName] = String(cellValue).trim() || null;
              }
            }
          });

          // 验证必填字段（TXNo 是必填的）
          // 调试信息：检查 TXNo 的值
          if (!rowData.TXNo || String(rowData.TXNo).trim() === '') {
            // 添加调试信息，帮助定位问题
            const txNoColumnIndex = headers.findIndex(
              (h) => h.toLowerCase().trim().includes('transaction') && 
                     h.toLowerCase().trim().includes('number')
            );
            const actualValue = txNoColumnIndex >= 0 ? row[txNoColumnIndex] : 'N/A';
            errors.push(
              `Row ${i + 1}: Transaction Number (TXNo) is required. ` +
              `Found value: "${actualValue}" (type: ${typeof actualValue}). ` +
              `Header: "${headers[txNoColumnIndex] || 'N/A'}"`
            );
            continue;
          }

          data.push(rowData);
        }

        resolve({ data, errors });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // 以二进制格式读取文件
    reader.readAsBinaryString(file);
  });
}

