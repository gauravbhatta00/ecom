import { useNavigate } from "react-router-dom";
import { Header } from "./layout/header";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const count = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return <Header user={user} authenticated={isAuthenticated} count={count} onLogout={() => { logout(); navigate("/"); }} />;
}
