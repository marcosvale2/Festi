import toast from "react-hot-toast";
import { useLoader } from "../context/LoaderContext";

let mostrarLoader, esconderLoader;

// permite inicializar funções do context
export function initLoaderContext(refs) {
  mostrarLoader = refs.mostrarLoader;
  esconderLoader = refs.esconderLoader;
}

export async function apiFetch(path, options = {}) {
  const baseUrl = "http://192.168.1.101:4000";
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (mostrarLoader) mostrarLoader();

  try {
    const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

    if (res.status === 401) {
      toast.error("⚠️ Sessão expirada. Faça login novamente.");
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }

    if (!res.ok) {
      throw new Error(data.error || "Erro na requisição");
    }

    return data;
  } catch (err) {
    console.error("❌ Erro na API:", err);
    if (!String(err.message).includes("Sessão expirada")) {
      toast.error(`❌ ${err.message}`);
    }
    throw err;
  } finally {
    if (esconderLoader) esconderLoader();
  }
}

export async function apiFetchBlob(path) {
  const baseUrl = "http://192.168.1.101:4000";
  const token = localStorage.getItem("token");

  if (mostrarLoader) mostrarLoader();

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      toast.error("⚠️ Sessão expirada. Faça login novamente.");
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }

    if (!res.ok) {
      throw new Error("Erro ao exportar arquivo");
    }

    return res.blob();
  } finally {
    if (esconderLoader) esconderLoader();
  }
}
