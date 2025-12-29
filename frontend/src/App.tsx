import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Buyer from "./pages/Buyer";
import Seller from "./pages/Seller";
import Broker from "./pages/Broker";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/buyer">Buyer</Link>
          <Link to="/seller">Seller</Link>
          <Link to="/broker">Broker</Link>
        </nav>
        <hr />
        <Routes>
          <Route path="/buyer" element={<Buyer />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/broker" element={<Broker />} />
          <Route path="*" element={<div>Go /buyer /seller /broker</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
