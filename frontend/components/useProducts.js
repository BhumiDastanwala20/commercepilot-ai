"use client";
import { useEffect, useState } from "react";

// Loads the public catalog (minPrice is stripped server-side).
export default function useProducts() {
  const [state, setState] = useState({ products: [], status: "loading" });

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((products) => {
        if (alive) setState({ products: Array.isArray(products) ? products : [], status: "ready" });
      })
      .catch(() => {
        if (alive) setState({ products: [], status: "error" });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
