import { FunctionComponent } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

// function Homepage() {

// make this function component
const Homepage: FunctionComponent<any> = () => {
  return (
    <main>
      <Header />

      <section className="px-4 md:px-8 lg:px-12 pt-2 min-h-[50vh] flex justify-center">
        <div className="w-full">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default Homepage;
