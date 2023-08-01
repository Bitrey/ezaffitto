import Header from "./Header";
import RentFinder from "./components/RentFinder";
import { useTranslation } from "react-i18next";

function Homepage() {
  const { t, i18n } = useTranslation();

  return (
    <main>
      <Header />

      <h3 className="mt-8 mb-2 text-center font-semibold text-2xl">
        {t("homepage.banner")}
      </h3>
      <section className="px-4 md:px-8 lg:px-12 pt-2 min-h-[50vh] flex justify-center">
        <div className="w-full">
          <RentFinder />
        </div>
      </section>
    </main>
  );
}

export default Homepage;
