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
                loading: "Loading..."
            },
            turnstile: {
                error: "Error in Turnstile CAPTCHA"
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
            }
        }
    },
    it: {
        translation: {
            common: {
                appName: "ezaffitto - Trova il tuo affitto a Bologna!",
                appNameShort: "ezaffitto",
                contact: "Contatta",
                loading: "Caricamento..."
            },
            turnstile: {
                error: "Errore nel CAPTCHA Turnstile"
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
