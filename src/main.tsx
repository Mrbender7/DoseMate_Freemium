import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker enregistré avec succès:', registration);
    }).catch(error => {
      console.error('Erreur d\'enregistrement du Service Worker:', error);
    });
  });
}
