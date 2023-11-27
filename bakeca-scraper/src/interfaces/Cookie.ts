export interface Cookie {
    domain: string;
    expirationDate?: number;
    hostOnly: boolean;
    httpOnly: boolean;
    name: string;
    path: string;
    sameSite?: string;
    secure: boolean;
    session: boolean;
    storeId: any;
    value: string;
}
