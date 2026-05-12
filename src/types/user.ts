export interface UserProfile {
  id: number;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  roleId?: number;
  roleName?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}