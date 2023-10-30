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
            tos: {
                using: "By using this site, you agree to the",
                tos: "Terms of Service",
                and: "and",
                cookie: "Cookie Policy",
                accept: "Accept",
                note: "Please note that the Terms of Service and the Cookie Policy are only available in Italian, and that the English translation is provided for convenience only. The Italian version is the only legally binding version."
            },
            turnstile: {
                error: "Error in Turnstile CAPTCHA",
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
                releaseToRefresh: "Release to refresh"
            },
            rentViewer: {
                perMonth: "/month",
                backToSearch: "Back to search",
                postNotFound: "Post not found",
                invalidPost: "Invalid post"
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
                madeWithLove: "Made with ♥ by"
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
            tos: {
                using: "Utilizzando questo sito, accetti i",
                tos: "Termini di Servizio",
                and: "e la",
                cookie: "Cookie Policy",
                accept: "Accetto",
                note: ""
            },
            turnstile: {
                error: "Errore nel CAPTCHA Turnstile",
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
                releaseToRefresh: "Rilascia per aggiornare"
            },
            rentViewer: {
                perMonth: "/mese",
                backToSearch: "Torna alla ricerca",
                postNotFound: "Post non trovato",
                invalidPost: "Post non valido"
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
                madeWithLove: "Creato con ♥ da"
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
