import type { Permission } from './Permissions';
export declare enum AclMode {
    control = "control"
}
export declare type AclPermission = Permission & {
    [mode in AclMode]?: boolean;
};
