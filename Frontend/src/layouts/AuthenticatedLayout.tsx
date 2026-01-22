import { Outlet } from "react-router-dom";
import UploadDrawer from "@/components/UploadDrawer";

export default function AuthenticatedLayout() {
  return (
    <>
      <Outlet />
      <UploadDrawer />
    </>
  );
}
