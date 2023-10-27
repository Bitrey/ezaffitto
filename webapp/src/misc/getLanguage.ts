export function getLanguage(i18nLang: string): string {
    if (i18nLang === "it" || i18nLang.startsWith("it-")) {
        return "it";
    }
    return "en";
}
