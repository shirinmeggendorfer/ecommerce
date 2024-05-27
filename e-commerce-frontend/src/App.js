import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from "./Components/Navbar/Navbar";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Product from "./Pages/Product";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import LoginSignup from "./Pages/LoginSignup";
import Loading from './Components/Loading/Loading.jsx'; // Stellen Sie sicher, dass dieser Pfad korrekt ist
import ThankYou from './Pages/ThankYou';
import { ShopProvider } from './Context/ShopContext';

// Import missing banners
import men_banner from "./Components/Assets/banner_mens.png";
import women_banner from "./Components/Assets/banner_women.png";
import kid_banner from "./Components/Assets/banner_kids.png";

function App() {
  return (
    <ShopProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Shop gender="all" />} />
        <Route path="/mens" element={<ShopCategory banner={men_banner} category="men" />} />
        <Route path="/womens" element={<ShopCategory banner={women_banner} category="women" />} />
        <Route path="/kids" element={<ShopCategory banner={kid_banner} category="kids" />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/signup" element={<LoginSignup />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
      <Footer />
    </ShopProvider>
  );
}

export default App;
