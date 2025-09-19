import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "./lib/socket";

const queryClient = new QueryClient();

const userId = JSON.parse(localStorage.getItem("chat-storage"))?.state?.user?._id;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider value={userId}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top" richColors expand={true} visibleToasts={3} />
        <NextTopLoader
          color="oklch(59.6% 0.145 163.225)"
          height={3}
          showSpinner={false}
        />

        <App />
      </QueryClientProvider>
    </SocketProvider>
  </StrictMode>
);
