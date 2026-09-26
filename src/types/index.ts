export interface Field {
  id: string;
  label: string;
  explanation: string;
  value: string;
  required?: boolean;
  type?: "text" | "number" | "textarea" | "email" | "date";
  page?: number;
  x?: number;
  y?: number;
  pdfFieldName?: string;
  validator?: (value: string) => string | null;
}

export interface PdfField extends Field {
  page?: number;
  x?: number;
  y?: number;
  fontSize?: number;
  pdfFieldName?: string;
}

export interface PdfResult {
  ok: boolean;
  bytes?: Uint8Array;
  pageCount?: number;
  error?: {
    type: string;
    message: string;
    details?: string;
  };
}

export interface UserProfile {
  name: string;
  birthDate: string;
  nationality: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  passport: {
    number: string;
    expiration: string;
  };
  contact: {
    phone: string;
    email: string;
  };
}

export interface OcrResult {
  sourceName: string;
  pageCount: number;
  pages: OcrPageResult[];
}

export interface OcrPageResult {
  page: number;
  text: string;
  blocks?: OcrBlock[];
}

export interface OcrBlock {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface AiWarning {
  fieldId: string;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface AiFieldExtractionRequest {
  ocrTxt: string;
  country: string;
  visaType: string;
  existingProfile?: Record<string, string>;
}

export interface AiFieldExtractionResponse {
  fields: Field[];
}
