// import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Home from "./icons/Home";
// import { LazyLoadImage } from "react-lazy-load-image-component";

const Header = () => {
  // const { t } = useTranslation();

  return (
    <header className="w-full min-h-[6rem] flex justify-around items-center bg-gray-50 text-gray-900">
      <div className="flex justify-center gap-4 items-center">
        {/* <LazyLoadImage
          alt="Logo"
          width={56}
          height={56}
          src="/images/debug-logo.png"
          effect="blur"
        /> */}

        <h1 className="text-red-600 font-semibold text-3xl tracking-tighter">
          <Link to="/" className="flex items-center gap-2">
            <Home fill="rgb(220 38 38 / var(--tw-text-opacity))" />
            ezaffitto
          </Link>
        </h1>
      </div>
      <div className="hidden md:block" />
      <div className="flex justify-center items-center gap-4">
        {/* <Textbox
                className="border-gray-50"
                type="text"
                placeholder="Cerca..."
            /> */}
        {/* <p>{t("homepage.account")}</p> */}
      </div>
    </header>
  );
};

export default Header;
