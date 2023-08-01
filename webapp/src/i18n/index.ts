import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            common: {
                contact: "Contact"
            },
            rentFinder: {
                noMoreOptions: "No more options found",
                searchPlaceholder: "Single room Corticella",
                maxPrice: "Up to"
            },
            rentViewer: {
                perMonth: "/month"
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
                contact: "Contatta"
            },
            rentFinder: {
                noMoreOptions: "Nessun'altra opzione trovata",
                searchPlaceholder: "Stanza singola Corticella",
                maxPrice: "Fino a"
            },
            rentViewer: {
                perMonth: "/mese"
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
