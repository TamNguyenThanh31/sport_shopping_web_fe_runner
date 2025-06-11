export interface Promotion {
  id?: number;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minimumOrderValue?: number;
  maxUsage?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
