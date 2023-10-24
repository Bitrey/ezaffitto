import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            common: {
                contact: "Contact",
                loading: "Loading..."
            },
            textbox: {
                searchPlaceholder: "Search..."
            },
            rentFinder: {
                noMoreOptions: "No more options found",
                searchPlaceholder: "Single room Corticella",
                maxPrice: "Up to",
                noMorePosts: "No more posts found",
                pullToRefresh: "Pull to refresh",
                releaseToRefresh: "Release to refresh"
            },
            rentViewer: {
                perMonth: "/month",
                backToSearch: "Back to search",
                postNotFound: "Post not found"
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
                contact: "Contatta",
                loading: "Caricamento..."
            },
            textbox: {
                searchPlaceholder: "Cerca..."
            },
            rentFinder: {
                noMoreOptions: "Nessun'altra opzione trovata",
                searchPlaceholder: "Stanza singola Corticella",
                maxPrice: "Fino a",
                noMorePosts: "Nessun altro post trovato",
                pullToRefresh: "Tira per aggiornare",
                releaseToRefresh: "Rilascia per aggiornare"
            },
            rentViewer: {
                perMonth: "/mese",
                backToSearch: "Torna alla ricerca",
                postNotFound: "Post non trovato"
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

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
