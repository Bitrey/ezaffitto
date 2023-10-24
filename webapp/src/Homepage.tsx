import { FunctionComponent, useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { createContext } from "react";

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

  return (
    <SearchQueryContext.Provider
      value={{ searchQuery, setSearchQuery, isLoading, setIsLoading }}
    >
      <main>
        <Header />

        <section className="px-4 md:px-8 lg:px-12 pt-2 min-h-[50vh] flex justify-center">
          <div className="w-full">
            <Outlet />
          </div>
        </section>
      </main>
    </SearchQueryContext.Provider>
  );
};

export default Homepage;
