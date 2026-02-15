
export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null;
    detail?: string | null;
    instance?: string | null;
    [key: string]: any;
}

export enum Role {
    User = 1,
    Admin = 2
}

export interface UpdateUserCommand {
    id: number;
    role: number;
    email: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export interface UserDto {
    id: number;
    role: number;
    email: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export interface SignInCommand {
    email?: string | null;
    password?: string | null;
}

export interface SignUpCommand {
    email?: string | null;
    password?: string | null;
}

export interface JwtDto {
    accessToken?: string | null;
}

export interface ResetPasswordCommand {
    token: string | null;
    newPassword: string | null;
}

export interface ForgotPasswordCommand {
    email: string | null;
}

export interface GetUsersQuery {
    [key: string]: any;
}

export type GetUsers = GetUsersQuery; // Alias for backward compatibility

// Customer Interfaces
export interface CustomerDto {
    id: number;
    name?: string | null;
    taxId?: string | null;
    city?: string | null;
    country?: string | null;
    www?: string | null;
    facebook?: string | null;
    address?: string | null; // Optional to fix UI access if API returns it
    zipCode?: string | null; // Optional to fix UI access
}

export interface CustomerDtoPagedResult {
    totalCount: number;
    items?: CustomerDto[] | null;
}

export interface AddCustomerCommand {
    id?: number | null;
    name?: string | null;
    taxId?: string | null;
    address?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    www?: string | null;
    facebook?: string | null;
}

export interface UpdateCustomerCommand {
    id: number;
    name?: string | null;
    taxId?: string | null;
    address?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    www?: string | null;
    facebook?: string | null;
}
