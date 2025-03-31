export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
  createdAt: string;
  updatedAt: string;
}
