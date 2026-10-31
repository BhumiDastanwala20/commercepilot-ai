const g = globalThis;

if (!g.__store) {
  g.__store = {
    rules: { maxDiscountPercent: 10, bulkThreshold: 10, bulkDiscountPercent: 15, approvalAbove: 500 },
    orders: [],
    products: [
      { id: "mug", name: "Ceramic Coffee Mug", description: "350ml handmade mug, blue/white/black", price: 18, minPrice: 13, stock: 200 },
      { id: "notebook", name: "Leather Notebook", description: "A5 refillable, brown leather", price: 32, minPrice: 24, stock: 80 },
      { id: "tote", name: "Canvas Tote Bag", description: "Heavy cotton tote, natural", price: 15, minPrice: 10, stock: 150 },
      { id: "candle", name: "Scented Soy Candle", description: "Lavender or vanilla, 40hr burn", price: 22, minPrice: 16, stock: 120 },
      { id: "organizer", name: "Wooden Desk Organizer", description: "Walnut finish, 5 compartments", price: 45, minPrice: 34, stock: 40 },
      { id: "stand", name: "Phone Stand", description: "Aluminum adjustable, silver/black", price: 25, minPrice: 18, stock: 90 },
      { id: "charger", name: "Wireless Charging Pad", description: "15W Qi charger", price: 29, minPrice: 21, stock: 60 },
      { id: "giftbox", name: "Gift Box Set", description: "Mug + candle + notebook, gift wrapped", price: 60, minPrice: 48, stock: 30 },
    ],
  };
}

export const store = g.__store;