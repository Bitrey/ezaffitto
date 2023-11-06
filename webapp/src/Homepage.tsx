import { FunctionComponent, useEffect, useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { createContext } from "react";
import { useCookies } from "react-cookie";
import TosCookiesAccept from "./components/TosCookies";
import Footer from "./Footer";

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
    <SearchQueryContext.Provider
      value={{ searchQuery, setSearchQuery, isLoading, setIsLoading }}
    >
      <main>
        <Header />

        <section className="px-4 md:px-8 lg:px-12 pt-2 min-h-[80vh] md:min-h-[69vh] flex justify-center dark:bg-gray-800 dark:text-white">
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
  );
};

export default Homepage;
