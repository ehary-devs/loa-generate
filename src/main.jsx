import React from "react";
import { createRoot } from "react-dom/client";
import SiloaPrototype from "./SiloaPrototype.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiloaPrototype />
  </React.StrictMode>
);
