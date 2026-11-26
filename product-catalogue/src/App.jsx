import { useEffect, useState } from "react";
import products from "./data/products.json";
import "./App.css";

const cartStorageKey = "product-catalogue-cart";
const productsById = new Map(products.map((product) => [product.id, product]));
const priceRanges = [
  { value: "all", label: "Price: All Prices", min: 0, max: Infinity },
  { value: "under-1000", label: "Under ₹1,000", min: 0, max: 999 },
  { value: "1000-5000", label: "₹1,000–₹5,000", min: 1000, max: 5000 },
  { value: "5001-10000", label: "₹5,001–₹10,000", min: 5001, max: 10000 },
  { value: "over-10000", label: "Above ₹10,000", min: 10001, max: Infinity },
];

function loadCart() {
  try {
    const savedCart = localStorage.getItem(cartStorageKey);
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) {
      throw new Error("Saved cart data must be an array.");
    }

    return parsedCart.filter(
      (item) =>
        item &&
        productsById.has(item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch (error) {
    console.error("Unable to load the saved cart from local storage.", error);
    return [];
  }
}

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [cart, setCart] = useState(loadCart);
  const [isCartPage, setIsCartPage] = useState(() => window.location.hash === "#cart");
  const selectedPriceRange = priceRanges.find((range) => range.value === priceRange);

  useEffect(() => {
    const syncPageWithHash = () => setIsCartPage(window.location.hash === "#cart");
    window.addEventListener("hashchange", syncPageWithHash);

    return () => window.removeEventListener("hashchange", syncPageWithHash);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
      console.error("Unable to save the cart to local storage.", error);
    }
  }, [cart]);

  const openCart = () => {
    window.location.hash = "#cart";
  };

  const openCatalogue = () => {
    window.location.hash = "";
  };

  const addToCart = (productId) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === productId);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentCart, { id: productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + change } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const product = productsById.get(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    const matchesPrice =
      product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="container">
      <header className="page-header">
        <h1>{isCartPage ? "Your Cart" : "Product Catalogue"}</h1>
        {isCartPage ? (
          <button type="button" className="page-navigation-button" onClick={openCatalogue}>
            Continue Shopping
          </button>
        ) : (
          <button type="button" className="page-navigation-button" onClick={openCart}>
            Cart ({cartItemCount})
          </button>
        )}
      </header>
      {isCartPage ? (
        <section className="cart" aria-labelledby="cart-title">
          <div className="cart-heading">
            <h2 id="cart-title">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
            </h2>
            {cart.length > 0 && (
              <button type="button" className="clear-cart" onClick={() => setCart([])}>
                Clear Cart
              </button>
            )}
          </div>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="cart-items">
                {cart.map((item) => {
                  const product = productsById.get(item.id);
                  if (!product) return null;

                  return (
                    <li className="cart-item" key={product.id}>
                      <img src={product.image} alt="" />
                      <div className="cart-product-info">
                        <h3>{product.name}</h3>
                        <p>₹{product.price.toLocaleString("en-IN")} each</p>
                      </div>
                      <div className="cart-quantity">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${product.name}`}
                          onClick={() => updateQuantity(product.id, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${product.name}`}
                          onClick={() => updateQuantity(product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="cart-line-total">
                        ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => removeFromCart(product.id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="cart-total">Total: ₹{cartTotal.toLocaleString("en-IN")}</p>
            </>
          )}
        </section>
      ) : (
        <>
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
                  <button type="button" onClick={() => addToCart(product.id)}>
                    Add to Cart
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
