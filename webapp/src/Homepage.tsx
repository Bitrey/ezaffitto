import { createContext, FunctionComponent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import TosCookiesAccept from "./components/TosCookies";
import { config } from "./config";
import { useTranslation } from "react-i18next";

// function Homepage() {

export const SearchQueryContext = createContext<{
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}>({
  searchQuery: "",
  setSearchQuery: () => {},
  isLoading: false,
  setIsLoading: () => {}
});

// make this function component
const Homepage: FunctionComponent<any> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [cookies, setCookie] = useCookies();
  const [tosCookiesAccepted, setTosCookiesAccepted] = useState<boolean>(false);

  const { i18n } = useTranslation();

  function acceptTosCookies() {
    setCookie("tosCookiesAccepted", true, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
    setTosCookiesAccepted(true);
  }

  useEffect(() => {
    if (cookies.tosCookiesAccepted) {
      setTosCookiesAccepted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={config.captchaV3SiteKey}
      language={i18n.language}
    >
      <SearchQueryContext.Provider
        value={{ searchQuery, setSearchQuery, isLoading, setIsLoading }}
      >
        <main>
          <Header />

          <section className="min-h-[80vh] md:min-h-[69vh] flex justify-center dark:bg-gray-800 dark:text-white">
            <div className="w-full">
              <Outlet />
            </div>
          </section>

          {!tosCookiesAccepted && (
            <TosCookiesAccept onAccept={acceptTosCookies} />
          )}

          <Footer />
        </main>
      </SearchQueryContext.Provider>
    </GoogleReCaptchaProvider>
  );
};

export default Homepage;
