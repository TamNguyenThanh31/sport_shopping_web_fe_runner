export interface Address {
  id?: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  isDefault?: boolean;
}
