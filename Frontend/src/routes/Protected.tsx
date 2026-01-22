import NotFound from "@/components/NotFound";
import AdminDashboard from "@/pages/AdminDashboard";
import DashboardPage from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { AuthLoader, AdminLoader } from "@/services/authLoader";

export const protectedRoutes = [
  {
    loader: AuthLoader,
    Component: AuthenticatedLayout,
    children: [
      {
        path: "/dashboard",
        Component: DashboardPage,
      },
      {
        path: "/profile",
        Component: Profile,
      },
      {
        loader: AdminLoader,
        path: "/admin-dashboard",
        Component: AdminDashboard,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
];
