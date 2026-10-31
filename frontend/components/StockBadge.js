export const LOW_STOCK = 25;

export default function StockBadge({ stock }) {
  if (stock <= 0)
    return (
      <span className="badge badge-danger">
        <span className="dot" /> Out of stock
      </span>
    );
  if (stock <= LOW_STOCK)
    return (
      <span className="badge badge-warning">
        <span className="dot" /> Only {stock} left
      </span>
    );
  return (
    <span className="badge badge-success">
      <span className="dot" /> In stock
    </span>
  );
}
