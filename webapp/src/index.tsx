import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "react-medium-image-zoom/dist/styles.css";

import "react-lazy-load-image-component/src/effects/blur.css";
import Homepage from "./Homepage";
import ByRentId from "./ByRentId";
import RentFinder from "./components/RentFinder";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    children: [
      {
        path: "/",
        element: <RentFinder />
      },
      {
        path: "/post/:id",
        element: <ByRentId />
      }
    ]
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
