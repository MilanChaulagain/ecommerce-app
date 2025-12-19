export const permissions: Record<string, string[]> = {
  admin: ['manage_users', 'manage_forms', 'manage_settings', 'view_orders', 'edit_products'],
  superemployee: ['manage_forms', 'review_submissions', 'edit_content'],
  salesemployee: ['view_orders', 'update_order_status'],
  contentcreator: ['create_content', 'edit_content'],
  customer: ['place_order', 'view_own_orders']
}

export function can(role: string | undefined, action: string) {
  if (!role) return false
  const list = permissions[role.toLowerCase()]
  if (!list) return false
  return list.includes(action)
}
