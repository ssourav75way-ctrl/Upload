import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.ts";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";

import { SnackbarProvider } from "notistack";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={4}
        autoHideDuration={2200}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        preventDuplicate
        slotProps={{
          snackbar: {
            sx: {
              borderRadius: 8,
              minWidth: 200,
              py: 0.5,
              px: 1,
            },
          },
          contentRoot: {
            sx: {
              borderRadius: 20,
              fontSize: "0.9rem",
              fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              padding: "6px 12px",
            },
          },
        }}
      >
        <RouterProvider router={router} />
      </SnackbarProvider>
    </Provider>
  </StrictMode>,
);
