import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TranslationProvider } from "./TranslationContext.tsx";
import { AuthProvider } from "./AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <TranslationProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </TranslationProvider>
);