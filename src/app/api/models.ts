
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
    firstName?: string | null;
    lastName?: string | null;
    role?: number | null;
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
// Contact Interfaces
export interface ContactDto {
    id: number;
    customerId?: number | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNo?: string | null;
    email?: string | null;
    customerName?: string | null;
}

export interface ContactDtoPagedResult {
    totalCount: number;
    items?: ContactDto[] | null;
}

export interface AddContactCommand {
    id?: number | null;
    customerId?: number | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNo?: string | null;
    email?: string | null;
}

export interface UpdateContactCommand {
    id: number;
    customerId?: number | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNo?: string | null;
    email?: string | null;
}

// Product Group Interfaces
export interface ProductGroupDto {
    id: number;
    name?: string | null;
    description?: string | null;
    createdAt: string;
    lastUpdatedAt?: string | null;
    removedAt?: string | null;
    productCount: number;
}

export interface ProductGroupDtoPagedResult {
    totalCount: number;
    items?: ProductGroupDto[] | null;
}

export interface AddProductGroupCommand {
    id?: number | null;
    name?: string | null;
    description?: string | null;
}

export interface UpdateProductGroupCommand {
    id: number;
    name?: string | null;
    description?: string | null;
}

// Product Interfaces
export interface ProductDto {
    id: number;
    productGroupId: number;
    groupName?: string | null;
    partNumber?: string | null;
    name?: string | null;
    description?: string | null;
    oemBrand?: string | null;
    listPrice?: number | null;
    weightKg?: number | null;
    createdAt: string;
    lastUpdatedAt?: string | null;
    removedAt?: string | null;
}

export interface ProductDtoPagedResult {
    totalCount: number;
    items?: ProductDto[] | null;
}

export interface AddProductCommand {
    id?: number | null;
    name?: string | null;
    productGroupId: number;
    partNumber?: string | null;
    description?: string | null;
    oemBrand?: string | null;
    listPrice?: number | null;
    weightKg?: number | null;
}

export interface UpdateProductCommand {
    id: number;
    name?: string | null;
    productGroupId: number;
    partNumber?: string | null;
    description?: string | null;
    oemBrand?: string | null;
    listPrice?: number | null;
    weightKg?: number | null;
}

// Currency Interfaces
export interface CurrencyDto {
    id: number;
    baseCurrency?: string | null;
    targetCurrency?: string | null;
    rate: number;
    createdAt: string;
    lastUpdatedAt?: string | null;
    removedAt?: string | null;
}

export interface CurrencyDtoPagedResult {
    totalCount: number;
    items?: CurrencyDto[] | null;
}

export interface AddCurrencyCommand {
    id?: number | null;
    baseCurrency?: string | null;
    targetCurrency?: string | null;
    rate: number;
}

export interface UpdateCurrencyCommand {
    id: number;
    baseCurrency?: string | null;
    targetCurrency?: string | null;
    rate: number;
}

export interface UpdateCurrencyListCommand {
    [key: string]: any;
}

