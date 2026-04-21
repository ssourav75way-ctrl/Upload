import ForgetPassword from "@/components/ForgetPassword";
import Loading from "@/components/Loading";

import SigninPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";

export const publicRoutes = [
  {
    path: "/",
    loader: Loading,
    Component: SigninPage,
  },
  {
    path: "/signup",
    loader: Loading,
    Component: SignupPage,
  },
  {
    path: "/createAccount",
    loader: Loading,
    Component: SignupPage,
  },
  {
    path: "/forgetPassword",
    loader: Loading,
    Component: ForgetPassword,
  },
];
