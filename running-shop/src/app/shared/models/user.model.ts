export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
  createdAt: string;
  updatedAt: string;
}
