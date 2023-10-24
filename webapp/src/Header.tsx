import { Link } from "react-router-dom";
import Home from "./icons/Home";
import Textbox from "./components/Textbox";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { SearchQueryContext } from "./Homepage";

const Header = () => {
  const { t } = useTranslation();

  const [typedSearchQuery, setTypedSearchQuery] = useState("");

  const { setSearchQuery, isLoading } = useContext(SearchQueryContext);

  async function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchQuery(typedSearchQuery.trim());
  }

  return (
    <header className="w-full min-h-[6rem] flex justify-around items-center bg-gray-50 text-gray-900">
      <div className="flex justify-center gap-4 items-center">
        <h1 className="text-red-600 font-semibold text-3xl tracking-tighter">
          <Link to="/" className="flex items-center gap-2">
            <Home fill="rgb(220 38 38 / var(--tw-text-opacity))" />
            <span className="select-none">ezaffitto</span>
          </Link>
        </h1>
      </div>
      <div className="hidden md:block" />
      <div className="hidden md:block" />
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
