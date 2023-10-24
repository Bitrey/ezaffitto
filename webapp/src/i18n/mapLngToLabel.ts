export function mapLngToLabel(lng: string): string {
    switch (lng) {
        case "en":
            return "🇬🇧 English";
        case "it":
            return "🇮🇹 Italiano";
        default:
            return "";
    }
}
