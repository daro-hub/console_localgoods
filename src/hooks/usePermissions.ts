import { useAuth } from '@/contexts/AuthContext';

export type Permission = 
  | 'view_companies'
  | 'create_companies'
  | 'edit_companies'
  | 'delete_companies'
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'view_orders'
  | 'create_orders'
  | 'edit_orders'
  | 'delete_orders'
  | 'view_analytics'
  | 'view_users'
  | 'manage_users'
  | 'system_admin';

const rolePermissions: Record<string, Permission[]> = {
  superadmin: [
    'view_companies', 'create_companies', 'edit_companies', 'delete_companies',
    'view_products', 'create_products', 'edit_products', 'delete_products',
    'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
    'view_analytics',
    'view_users', 'manage_users',
    'system_admin'
  ],
  admin: [
    'view_companies', 'create_companies', 'edit_companies', 'delete_companies',
    'view_products', 'create_products', 'edit_products', 'delete_products',
    'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
    'view_analytics',
    'view_users'
  ],
  manager: [
    'view_companies', 'create_companies', 'edit_companies',
    'view_products', 'create_products', 'edit_products',
    'view_orders', 'create_orders', 'edit_orders',
    'view_analytics'
  ],
  user: [
    'view_companies',
    'view_products',
    'view_orders'
  ]
};

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.role) {
      return false;
    }

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessPage = (page: string): boolean => {
    switch (page) {
      case 'companies':
        return hasPermission('view_companies');
      case 'products':
        return hasPermission('view_products');
      case 'orders':
        return hasPermission('view_orders');
      case 'analytics':
        return hasPermission('view_analytics');
      case 'users':
        return hasPermission('view_users');
      default:
        return true; // Pagine pubbliche come home, profile
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'superadmin';
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessPage,
    isAdmin,
    isSuperAdmin,
    userRole: user?.role || 'guest',
    permissions: user?.role ? rolePermissions[user.role] || [] : []
  };
} 