import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "./lib/socket";
import { JitsiCallProvider } from "./lib/jitsiCall";

const queryClient = new QueryClient();

const themeStorage = JSON.parse(localStorage.getItem("chat-theme") || "{}");
const initialTheme = themeStorage?.state?.theme || "light";

document.documentElement.classList.toggle("dark", initialTheme === "dark");
document.documentElement.style.colorScheme =
  initialTheme === "dark" ? "dark" : "light";

const userId = JSON.parse(localStorage.getItem("chat-storage"))?.state?.user
  ?._id;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider value={userId}>
      <QueryClientProvider client={queryClient}>
        <JitsiCallProvider>
          <Toaster
            position="top-center"
            richColors
            expand
            visibleToasts={3}
            className="z-[9999] md:left-1/2 md:-translate-x-1/2"
          />
          <NextTopLoader
            color="oklch(59.6% 0.145 163.225)"
            height={3}
            showSpinner={false}
          />

          <App />
        </JitsiCallProvider>
      </QueryClientProvider>
    </SocketProvider>
  </StrictMode>,
);
