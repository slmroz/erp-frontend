export interface UserDto {
    id: number;
    email?: string | null;
}

export interface GetUsers {
    // Add properties if defined in spec, currently 'additionalProperties: false' and empty in spec example
    [key: string]: any;
}

export interface ProblemDetails {
    type?: string | null;
    title?: string | null;
    status?: number | null;
    detail?: string | null;
    instance?: string | null;
    [key: string]: any;
}
