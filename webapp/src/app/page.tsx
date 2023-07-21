import Header from "./Header";
import { labels } from "@/i18n/labels";
import RentFinder from "@/components/RentFinder";

export default function Home() {
  return (
    <main>
      <Header />

      <h3 className="mt-8 mb-2 text-center font-semibold text-2xl">
        {labels.homepageBanner}
      </h3>
      <section className="px-4 md:px-8 lg:px-12 pt-2 min-h-[50vh] flex justify-center">
        <div className="w-full">
          <RentFinder />
        </div>
      </section>
    </main>
  );
}
