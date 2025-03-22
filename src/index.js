import React from "react";
import ReactDom from "react-dom/client";
import App from "./App";
import "./index.css";
import RatingStarts from "./RatingStars";

const root = ReactDom.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <RatingStarts /> */}
  </React.StrictMode>
);
