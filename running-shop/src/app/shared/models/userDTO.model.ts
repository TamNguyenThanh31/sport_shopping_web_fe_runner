export interface UserDTO {
  id?: number;
  username: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'STAFF';
  createdAt: string;
  updatedAt: string;
  onlineStatus?: boolean;
}
