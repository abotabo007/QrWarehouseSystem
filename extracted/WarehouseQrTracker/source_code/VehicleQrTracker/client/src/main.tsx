import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createPortal } from "react-dom";

// Add FontAwesome script
const fontAwesomeScript = document.createElement("script");
fontAwesomeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js";
fontAwesomeScript.crossOrigin = "anonymous";
document.head.appendChild(fontAwesomeScript);

// Add title
if (!document.title) {
  document.title = "CRI Acqui Terme - Sistema di Gestione";
}

// Add meta description
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Sistema di gestione per la Croce Rossa Italiana - Comitato di Acqui Terme";
document.head.appendChild(metaDescription);

// Add favicon
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.href = "https://upload.wikimedia.org/wikipedia/it/thumb/4/4a/Emblema_CRI.svg/800px-Emblema_CRI.svg.png";
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
