import moment from "moment-timezone";

function mapRentalType(rentalType: string) {
    switch (rentalType) {
        case "singleRoom":
            return "Stanza singola";
        case "doubleRoom":
            return "Stanza doppia";
        case "studio":
            return "Monolocale";
        case "apartment":
            return "Appartamento";
        case "house":
            return "Casa";
        case "other":
        default:
            return "Altro";
    }
}

export function formatTelegramMessage(n: number, tot: number, data: any) {
    const { _id, rentalType, monthlyPrice, description, date, url, zone } =
        data;

    const message = [
        `✨ Annuncio **${n + 1}**/${tot + 1} ✨\n`,
        `🏠 Stanza in affitto 🏠`,
        `Tipo: **${mapRentalType(rentalType)}**`,
        `Prezzo mensile: ${
            monthlyPrice ? `**€${monthlyPrice}**` : "_sconosciuto_"
        }**`,
        `Zona: ${zone ? `**${zone}**` : "_sconosciuta_"}**\n`,
        `📅 Aggiunto ${moment(date)
            .tz("Europe/Rome")
            .locale("it")
            .fromNow()} 📅\n`,
        `📍 Descrizione 📍`,
        `${description}\n`,
        `🔗 Per maggiori dettagli, clicca il link qui sotto:`,
        `${url}\n`,
        `💡 Scopri di più su questo annuncio su ezaffitto! 💡`
    ]
        .filter(e => e)
        .join("\n");

    return message;
}
