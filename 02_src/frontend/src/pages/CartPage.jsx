import { useState } from "react";
import Navbar from "../components/Navbar";
import "./CartPage.css";

function CartPage() {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || [],
  );

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: (item.quantity || 1) + 1 }
        : item,
    );

    updateCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart
      .map((item) =>
        item.product_id === productId
          ? { ...item, quantity: (item.quantity || 1) - 1 }
          : item,
      )
      .filter((item) => item.quantity > 0);

    updateCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item.product_id !== productId);

    updateCart(updatedCart);
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );

  const handleCheckout = () => {
    if (window.confirm("Confirm purchase?")) {
      localStorage.removeItem("cart");
      setCart([]);
      alert("Purchase completed successfully!");
    }
  };

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-content">
        <h1>My Cart</h1>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item.product_id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.product_type}</p>
                  <p>
                    <strong>Subtotal:</strong>{" "}
                    {(item.price * (item.quantity || 1)).toFixed(2)} SAR
                  </p>
                </div>

                <div className="cart-actions">
                  <button
                    className="quantity-btn"
                    onClick={() => decreaseQuantity(item.product_id)}
                  >
                    -
                  </button>

                  <span className="quantity-value">{item.quantity || 1}</span>

                  <button
                    className="quantity-btn"
                    onClick={() => increaseQuantity(item.product_id)}
                  >
                    +
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.product_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <div className="cart-total">
            <h2>Total: {total.toFixed(2)} SAR</h2>
          </div>
        )}

        {cart.length > 0 && (
          <div className="cart-footer">
            <button className="checkout-btn" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default CartPage;
