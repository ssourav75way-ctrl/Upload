import { redirect } from "react-router-dom";
import { store } from "../store/store";
import { decodeJwt } from "./jwt";

export const AuthLoader = () => {
  const accessToken = store.getState().auth.accessToken;
  if (!accessToken) {
    return redirect("/");
  }
  return null;
};

export const AdminLoader = () => {
  const accessToken = store.getState().auth.accessToken;
  if (!accessToken) {
    return redirect("/");
  }

  try {
    const payload = decodeJwt(accessToken);
    if (!payload.roles.includes("ADMIN")) {
      return redirect("/dashboard");
    }
  } catch (error) {
    return redirect("/");
  }

  return null;
};
