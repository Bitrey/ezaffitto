import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { Resource } from "i18next";

const resources: Resource = {
    en: {
        translation: {
            common: {
                appName: "ezaffitto - Find your rent in Bologna!",
                appNameShort: "ezaffitto",
                contact: "Contact",
                loading: "Loading...",
                error: "Error",
                close: "Close",
                on: "on"
            },
            errors: {
                notFound: "Not found",
                unknown: "Unknown error",
                geolocationFailed: "Geolocation failed",
                noResultsFound: "No results found"
            },
            tos: {
                using: "By using this site, you agree to the",
                tos: "Terms of Service",
                and: "and",
                cookie: "Cookie Policy",
                accept: "Accept",
                note: "Please note that the Terms of Service and the Cookie Policy are only available in Italian, and that the English translation is provided for convenience only. The Italian version is the only legally binding version."
            },
            captcha: {
                error: "Error in CAPTCHA",
                missing: "Missing CAPTCHA",
                failed: "CAPTCHA verification failed (please reload the page)",
                pleaseSolve: "Please solve the CAPTCHA to continue"
            },
            textbox: {
                searchPlaceholder: "Search..."
            },
            rentFinder: {
                noMoreOptions: "No more options found",
                searchPlaceholder: "Single room Corticella",
                maxPrice: "Up to",
                noPosts: "No posts",
                noPostSelected: "No post selected",
                noMorePosts: "No more posts found",
                pullToRefresh: "Pull to refresh",
                releaseToRefresh: "Release to refresh",
                orderBy: "Order by"
            },
            orderByOptions: {
                priceAsc: "Price (ascending)",
                priceDesc: "Price (descending)",
                dateAsc: "Date (ascending)",
                dateDesc: "Date (descending)"
            },
            rentViewer: {
                perMonth: "/month",
                backToSearch: "Back to search",
                postNotFound: "Post not found",
                invalidPost: "Invalid post",
                loadingError: "Error while loading"
            },
            homepage: {
                banner: "Find your rent in Bologna!",
                account: "Account"
            },
            rentalType: {
                singleRoom: "Single Room",
                doubleRoom: "Double Room",
                studio: "Studio",
                apartment: "Apartment",
                house: "House",
                other: "Other"
            },
            footer: {
                madeWithLove: "Made with ♥ by",
                forInfoAndSuggestions: "For info and suggestions"
            },
            rentalPost: {
                rentalType: "Rental type 🏠",
                monthlyPrice: "Monthly price 💰",
                securityDepositMonths: "Security deposit (months) 💰",
                zone: "Zone 🌍",
                sexRestrictions: "Gender restrictions ♂️♀️",
                occupationalRestrictions: "Occupational restrictions 👩‍⚕️",
                lgbtFriendly: "LGBT friendly 🏳️‍🌈",
                furnished: "Furnished 🛋️",
                availabilityStartDate: "Availability start date 🗓️",
                availabilityEndDate: "Availability end date 🗓️",
                contractDurationMonths: "Contract duration (months) ⏳",
                hasBalcony: "Balcony 🌇",
                hasParking: "Parking 🚗",
                address: "Address 🏠",
                floorNumber: "Floor number 🔼",
                rooms: "Rooms 🛏️",
                bathrooms: "Bathrooms 🚿",
                areaSqMeters: "Area (sq meters) 📏",
                priceIncludesTaxes: "Price includes taxes 💰",
                smokingAllowed: "Smoking allowed 🚬",
                hasAirConditioning: "Air conditioning ❄️",
                hasHeating: "Heating 🔥",
                hasElevator: "Elevator 🛗: "
            },
            sexRestrictions: {
                everyone: "Everyone",
                males: "Males",
                females: "Females",
                other: "Other"
            },
            occupationalRestrictions: {
                everyone: "Everyone",
                students: "Students",
                workers: "Workers",
                other: "Other"
            },
            map: {
                findOnMap: "Find on map",
                approxPosition: "Approximate position"
            },
            dropdown: {
                noOptions: "No options"
            }
        }
    },
    it: {
        translation: {
            common: {
                appName: "ezaffitto - Trova il tuo affitto a Bologna!",
                appNameShort: "ezaffitto",
                contact: "Contatta",
                loading: "Caricamento...",
                error: "Errore",
                close: "Chiudi",
                on: "su"
            },
            errors: {
                notFound: "Non trovato",
                unknown: "Errore sconosciuto",
                geolocationFailed: "Geolocalizzazione fallita",
                noResultsFound: "Nessun risultato trovato"
            },
            tos: {
                using: "Utilizzando questo sito, accetti i",
                tos: "Termini di Servizio",
                and: "e la",
                cookie: "Cookie Policy",
                accept: "Accetto",
                note: ""
            },
            captcha: {
                error: "Errore nel CAPTCHA",
                missing: "CAPTCHA mancante",
                failed: "Verifica CAPTCHA fallita (per favore ricarica la pagina)",
                pleaseSolve: "Risolvi il CAPTCHA per continuare"
            },
            textbox: {
                searchPlaceholder: "Cerca..."
            },
            rentFinder: {
                noMoreOptions: "Nessun'altra opzione trovata",
                searchPlaceholder: "Stanza singola Corticella",
                maxPrice: "Fino a",
                noPosts: "Nessun post",
                noPostSelected: "Nessun post selezionato",
                noMorePosts: "Nessun altro post trovato",
                pullToRefresh: "Tira per aggiornare",
                releaseToRefresh: "Rilascia per aggiornare",
                orderBy: "Ordina per"
            },
            orderByOptions: {
                priceAsc: "Prezzo (crescente)",
                priceDesc: "Prezzo (decrescente)",
                dateAsc: "Data (crescente)",
                dateDesc: "Data (decrescente)"
            },
            rentViewer: {
                perMonth: "/mese",
                backToSearch: "Torna alla ricerca",
                postNotFound: "Post non trovato",
                invalidPost: "Post non valido",
                loadingError: "Errore nel caricamento"
            },
            homepage: {
                banner: "Trova il tuo affitto a Bologna!",
                account: "Account"
            },
            rentalType: {
                singleRoom: "Camera Singola",
                doubleRoom: "Camera Doppia",
                studio: "Monolocale",
                apartment: "Appartamento",
                house: "Casa",
                other: "Altro"
            },
            footer: {
                madeWithLove: "Creato con ♥ da",
                forInfoAndSuggestions: "Per info e suggerimenti"
            },
            rentalPost: {
                rentalType: "Tipo di affitto 🏠",
                monthlyPrice: "Prezzo mensile 💰",
                securityDepositMonths: "Cauzione (mesi) 💰",
                zone: "Zona 🌍",
                sexRestrictions: "Restrizioni di genere ♂️♀️",
                occupationalRestrictions: "Restrizioni di occupazione 👩‍⚕️",
                lgbtFriendly: "LGBT friendly 🏳️‍🌈",
                furnished: "Arredato 🛋️",
                availabilityStartDate: "Disponibile dal 🗓️",
                availabilityEndDate: "Disponibile fino al 🗓️",
                contractDurationMonths: "Durata del contratto (mesi) ⏳",
                hasBalcony: "Balcone 🌇",
                hasParking: "Parcheggio 🚗",
                address: "Indirizzo 🏠",
                floorNumber: "Numero piano 🔼",
                rooms: "Stanze 🛏️",
                bathrooms: "Bagni 🚿",
                areaSqMeters: "Area (mq) 📏",
                priceIncludesTaxes: "Prezzo include tasse 💰",
                smokingAllowed: "Permesso fumare 🚬",
                hasAirConditioning: "Aria condizionata ❄️",
                hasHeating: "Riscaldamento 🔥",
                hasElevator: "Ascensore 🛗: "
            },
            sexRestrictions: {
                everyone: "Chiunque",
                males: "Maschi",
                females: "Femmine",
                other: "Altro"
            },
            occupationalRestrictions: {
                everyone: "Chiunque",
                students: "Studenti",
                workers: "Lavoratori",
                other: "Altro"
            },
            map: {
                findOnMap: "Trova sulla mappa",
                approxPosition: "Posizione approssimativa"
            },
            dropdown: {
                noOptions: "Nessuna opzione"
            }
        }
    }
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
