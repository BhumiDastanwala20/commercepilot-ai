"use client";
import ProductCard from "./ProductCard";
import useProducts from "./useProducts";

export default function HomeProducts() {
  const { products, status } = useProducts();

  if (status === "error") return <p role="alert">Could not load products. Please refresh the page.</p>;

  return (
    <div className="product-grid" aria-busy={status === "loading"}>
      {status === "loading"
        ? Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)
        : products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
