import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Toaster position="top" richColors expand={true} visibleToasts={3} />
    <NextTopLoader
      color="oklch(59.6% 0.145 163.225)"
      height={3}
      showSpinner={false}
    />
    <App />
  </StrictMode>
);
