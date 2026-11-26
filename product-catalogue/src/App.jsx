import { useState } from "react";
import products from "./data/products.json";
import "./App.css";

const priceRanges = [
  { value: "all", label: "Price: All Prices", min: 0, max: Infinity },
  { value: "under-1000", label: "Under ₹1,000", min: 0, max: 999 },
  { value: "1000-5000", label: "₹1,000–₹5,000", min: 1000, max: 5000 },
  { value: "5001-10000", label: "₹5,001–₹10,000", min: 5001, max: 10000 },
  { value: "over-10000", label: "Above ₹10,000", min: 10001, max: Infinity },
];

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const selectedPriceRange = priceRanges.find((range) => range.value === priceRange);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    const matchesPrice =
      product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="container">
      <h1>Product Catalogue</h1>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
          <option value="Accessories">Accessories</option>
        </select>
        <select
          aria-label="Filter by price range"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
              <p>Price: ₹{product.price}</p>
              <p>Rating: {product.rating}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
