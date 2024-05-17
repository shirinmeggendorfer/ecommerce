import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import AddProduct from './Pages/Productorganization/AddProduct/AddProduct';
import ListProduct from './Pages/Productorganization/ListProduct/ListProduct';
import AddCategory from './Pages/Categoryorganization/AddCategory/AddCategory';
import ListCategory from './Pages/Categoryorganization/ListCategory/ListCategory';
import AddCollection from './Pages/Collectionorganization/AddCollection/AddCollection';
import ListCollection from './Pages/Collectionorganization/ListCollection/ListCollection';
import AddCoupon from './Pages/Couponorganization/AddCoupon/AddCoupon';
import ListCoupon from './Pages/Couponorganization/ListCoupon/ListCoupon';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
        <Route path="/addproduct" element={<ProtectedRoute element={AddProduct} />} />
        <Route path="/listproduct" element={<ProtectedRoute element={ListProduct} />} />
        <Route path="/addcategory" element={<ProtectedRoute element={AddCategory} />} />
        <Route path="/listcategory" element={<ProtectedRoute element={ListCategory} />} />
        <Route path="/addcollection" element={<ProtectedRoute element={AddCollection} />} />
        <Route path="/listcollection" element={<ProtectedRoute element={ListCollection} />} />
        <Route path="/addcoupon" element={<ProtectedRoute element={AddCoupon} />} />
        <Route path="/listcoupon" element={<ProtectedRoute element={ListCoupon} />} />
      </Routes>
    </Router>
  );
}

export default App;
