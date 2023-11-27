import { Protocol } from "puppeteer-core";
import { Cookie } from "../interfaces/Cookie";

export function mapCookiesToPuppeteer(
    cookies: Cookie[]
): Protocol.Network.CookieParam[] {
    return cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        // expires: cookie.expirationDate,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure
    }));
}
