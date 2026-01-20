// Punchout API Type Definitions

export interface PunchoutCartItem {
  productId: string;        // Required: Product ID
  sku?: string;             // Optional: Product SKU
  productName?: string;      // Optional: Product name
  quantity: number;         // Required: Quantity (≥ 1)
  unitPrice?: number;        // Optional: Unit price
  supplierPartId?: string;   // Optional: Supplier part ID
  unitOfMeasure?: string;    // Optional: Unit of measure (UOM)
}

export interface PunchoutReturnRequest {
  sessionToken: string;                    // Required: Session token
  items: PunchoutCartItem[];               // Required: Cart items list (at least 1 item)
  buyerOrderNumber?: string;                // Optional: Buyer order number
  notes?: string;                          // Optional: Notes
}

export interface PunchoutReturnResponse {
  orderId: string | null;                  // Order ID (usually null)
  orderNumber: string | null;              // Order number (usually null)
  status: string | null;                  // Order status
  success: boolean;                        // Whether successful
  message: string;                         // Response message
  remainingAttempts: number | null;        // Remaining retry attempts
}

export interface ValidateResponse {
  valid: boolean;                          // Whether session is valid
  error?: string;                          // Error message (if any)
}

