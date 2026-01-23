import { Outlet } from "react-router-dom";
import UploadDrawer from "@/components/UploadDrawer";
import { useEffect } from "react";
import { handleNotificationAfterLogin } from "@/pages/Notificationlogic";

export default function AuthenticatedLayout() {
  useEffect(() => {
    handleNotificationAfterLogin();
  }, []);
  return (
    <>
      <Outlet />
      <UploadDrawer />
    </>
  );
}
