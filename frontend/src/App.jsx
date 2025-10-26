import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useLoader } from "./context/LoaderContext";
import { initLoaderContext } from "./services/api";

export default function App() {
  const loader = useLoader();

  useEffect(() => {
    initLoaderContext(loader);
  }, [loader]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Outlet />
    </div>
  );
}
