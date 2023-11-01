import { Link } from "react-router-dom";
import Home from "./icons/Home";
// import Textbox from "./components/Textbox";
import { useTranslation } from "react-i18next";
// import { useContext, useState } from "react";
// import { SearchQueryContext } from "./Homepage";
// import Button from "./components/Button";
import { mapLngToLabel } from "./i18n/mapLngToLabel";
import { config } from "./config";
import { getLanguage } from "./misc/getLanguage";

const Header = () => {
  const {
    i18n
    // , t
  } = useTranslation();

  // const [typedSearchQuery, setTypedSearchQuery] = useState("");

  // const { setSearchQuery, isLoading } = useContext(SearchQueryContext);

  // async function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   setSearchQuery(typedSearchQuery.trim());
  // }

  function setLanguage(lng: string) {
    if (typeof (document.activeElement as any)?.blur === "function") {
      (document.activeElement as any)?.blur();
    }

    if (lng === i18n.language) return;
    i18n.changeLanguage(lng);
  }

  return (
    <header className="w-full min-h-[6rem] flex justify-around items-center bg-gray-50 dark:bg-black dark:text-white text-gray-900">
      <div className="flex justify-center gap-4 items-center">
        <h1 className="text-red-600 dark:text-white font-semibold text-3xl tracking-tighter">
          <Link to="/" className="flex items-center gap-2">
            <Home className="fill-red-600 dark:fill-white" />
            <span className="select-none">ezaffitto</span>
          </Link>
        </h1>
      </div>
      <div className="hidden md:block" />
      <div className="flex justify-center items-center gap-4 z-50">
        {/* en and it emojis to change lng */}
        <div tabIndex={0} className="group relative inline-block p-5">
          <button className="flex items-center bg-gray-50 dark:bg-black text-red-600 hover:text-red-700 dark:text-white dark:hover:text-gray-200 underline transition-colors px-1 rounded p-2 text-[16px] focus:outline-none">
            {mapLngToLabel(getLanguage(i18n.language)) ||
              "-- select language --"}{" "}
            ⌄
          </button>
          <ul className="hidden group-focus-within:block list-none absolute bg-gray-50 dark:bg-gray-600 w-40 z-1 shadow-lg animate-slideIn">
            {config.languages.map(e => (
              <li
                key={e}
                onClick={() => setLanguage(e)}
                className="py-3 px-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-400 hover:text-blue-700 dark:hover:text-white dark:text-gray-100"
              >
                {mapLngToLabel(e)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* <div className="hidden md:flex justify-center items-center gap-4"> */}
      {/* <form
        onSubmit={onSearchSubmit}
        className="flex justify-center items-center gap-4"
      >
        <Textbox
          className="border-gray-50"
          type="text"
          placeholder={t("textbox.searchPlaceholder")}
          disabled={isLoading}
          value={typedSearchQuery}
          onChange={e => setTypedSearchQuery(e.target.value)}
        />
      </form> */}
    </header>
  );
};

export default Header;
