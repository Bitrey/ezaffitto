import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: {
            rentFinder: {
                noMoreOptions: "No more options found",
                searchPlaceholder: "Single room Corticella"
            },
            rentViewer: {
                perMonth: "/month"
            },
            homepage: {
                banner: "Find your rent in Bologna!"
            }
        }
    },
    it: {
        translation: {
            rentFinder: {
                noMoreOptions: "Nessun'altra opzione trovata",
                searchPlaceholder: "Stanza singola Corticella"
            },
            rentViewer: {
                perMonth: "/mese"
            },
            homepage: {
                banner: "Trova il tuo affitto a Bologna!"
            }
        }
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    }
});

export default i18n;
