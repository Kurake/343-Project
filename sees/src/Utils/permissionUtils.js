export const hasPermission = (user, permission) => {
    return user?.getPermissions?.().includes(permission);
};