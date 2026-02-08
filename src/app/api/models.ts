
export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null;
    detail?: string | null;
    instance?: string | null;
    [key: string]: any;
}

export interface UserDto {
    id: number;
    email?: string | null;
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
