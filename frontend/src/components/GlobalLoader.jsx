import React from "react";
import { useLoader } from "../context/LoaderContext";
import { createPortal } from "react-dom";

export default function GlobalLoader() {
  const { loading } = useLoader();
  if (!loading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-white border-t-pink-500 rounded-full animate-spin"></div>
    </div>,
    document.body
  );
}
