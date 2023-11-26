import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { Resource } from "i18next";

const resources: Resource = {
    en: {
        translation: {
            welcome: {
                title: "Welcome to ezaffitto!",
                subtitle: "Your portal for finding rents in Italy",
                where: "Where are you looking for a rent?",
                chooseCity: "Choose your city",
                rentsIn: "Rents in {{city}}",
                cityNotYetAvailable: "{{city}} not yet available 😭",
                aProjectBy: "A project by",
                togetherWith: "created together with"
            },
            common: {
                // TODO to change
                appName: "ezaffitto - Find your rent in Italy!",
                appNameShort: "ezaffitto",
                contact: "Contact",
                loading: "Loading...",
                error: "Error",
                close: "Close",
                on: "on",
                roomsInCity: "Rooms for rent in {{city}}"
            },
            city: {
                bologna: "Bologna",
                milano: "Milan",
                roma: "Rome",
                torino: "Turin",
                firenze: "Florence",
                napoli: "Naples",
                padova: "Padua",
                genova: "Genoa"
            },
            errors: {
                notFound: "Not found",
                unknown: "Unknown error",
                geolocationFailed: "Geolocation failed",
                noResultsFound: "No results found",
                invalidCity: "Invalid city",
                cityNotEnabled: "The selected city is not enabled! 😭",
                invalidCityDescription:
                    "The selected city is not among the available ones.",
                timeout:
                    "Timeout error, please check your Internet connection and reload the page."
            },
            tos: {
                title: "Terms and Conditions and Cookie Policy of ezaffitto",
                using: "By using this site, you agree to the",
                tos: "Terms of Service",
                and: "and",
                cookie: "Cookie Policy",
                accept: "Accept",
                note: "Please note that the Terms of Service and the Cookie Policy are only available in Italian, and that the English translation is provided for convenience only. The Italian version is the only legally binding version. In order to view the Italian version, please change the language of the site to Italian by clicking on the button below.",
                changeToItalian: "Change to Italian"
            },
            captcha: {
                error: "Error in CAPTCHA",
                missing: "Missing CAPTCHA",
                failed: "CAPTCHA verification failed, please reload the page",
                pleaseSolve: "Please solve the CAPTCHA to continue"
            },
            textbox: {
                searchPlaceholder: "Search..."
            },
            rentFinder: {
                loadingPosts: "Loading posts...",
                noMoreOptions: "No more options found",
                searchPlaceholder: "Single room Corticella",
                maxPrice: "Up to",
                noPostsAvailable: "No posts available 😭😭",
                noPostSelected: "No post selected",
                noMorePosts: "You reached the end!",
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
                loadingError: "Error while loading",
                noDescription: "This post has no description"
            },
            homepage: {
                banner: "Find your rent in",
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
            welcome: {
                title: "Benvenuto su ezaffitto!",
                subtitle: "Il tuo portale per la ricerca di affitti",
                where: "Dove stai cercando un affitto?",
                chooseCity: "Scegli la tua città",
                rentsIn: "Affitti a {{city}}",
                cityNotYetAvailable: "{{city}} non ancora disponibile 😭",
                aProjectBy: "Un progetto di",
                togetherWith: "ideato assieme a"
            },
            common: {
                appName: "ezaffitto - Trova il tuo affitto!",
                appNameShort: "ezaffitto",
                contact: "Contatta",
                loading: "Caricamento...",
                error: "Errore",
                close: "Chiudi",
                on: "su",
                roomsInCity: "Stanze in affitto a {{city}}"
            },
            city: {
                bologna: "Bologna",
                milano: "Milano",
                roma: "Roma",
                torino: "Torino",
                firenze: "Firenze",
                napoli: "Napoli",
                padova: "Padova",
                genova: "Genova"
            },
            errors: {
                notFound: "Non trovato",
                unknown: "Errore sconosciuto",
                geolocationFailed: "Geolocalizzazione fallita",
                noResultsFound: "Nessun risultato trovato",
                invalidCity: "Città non valida",
                cityNotEnabled:
                    "La città selezionata non è ancora abilitata! 😭",
                invalidCityDescription:
                    "La città selezionata non è tra quelle disponibili.",
                timeout:
                    "Errore di timeout, per favore controlla la tua connessione Internet e ricarica la pagina."
            },
            tos: {
                title: "Termini e Condizioni e Cookie Policy di ezaffitto",
                using: "Utilizzando questo sito, accetti i",
                tos: "Termini di Servizio",
                and: "e la",
                cookie: "Cookie Policy",
                accept: "Accetto",
                note: "",
                changeToItalian: "Cambia in italiano"
            },
            captcha: {
                error: "Errore nel CAPTCHA",
                missing: "CAPTCHA mancante",
                failed: "Verifica CAPTCHA fallita, per favore ricarica la pagina",
                pleaseSolve: "Risolvi il CAPTCHA per continuare"
            },
            textbox: {
                searchPlaceholder: "Cerca..."
            },
            rentFinder: {
                loadingPosts: "Caricamento dei post...",
                noMoreOptions: "Nessun'altra opzione trovata",
                searchPlaceholder: "Stanza singola Corticella",
                maxPrice: "Fino a",
                noPostsAvailable: "Nessun post disponibile 😭😭",
                noPostSelected: "Nessun post selezionato",
                noMorePosts: "Sei arrivatə alla fine!",
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
                loadingError: "Errore nel caricamento",
                noDescription: "Questo post non ha una descrizione"
            },
            homepage: {
                banner: "Trova il tuo affitto a",
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
