export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;    // số phần tử/trang do backend trả về
  number: number;  // trang hiện tại (0‐based)
}
