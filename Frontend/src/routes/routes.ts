import NotFound from "@/components/NotFound";
import { createBrowserRouter } from "react-router";
import { publicRoutes } from "./Public";
import { protectedRoutes } from "./Protected";

export const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: "*",
    Component: NotFound,
  },
]);
