import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import nav_dropdown from '../Assets/nav_dropdown.png';


  const Navbar = () => {
   
 
  
  
   
   
  return (
    <div className='nav'>

    <img className='nav-dropdown' src={nav_dropdown} alt="" />
 
      <Link to='/listcategory' >Categories</Link>
      <Link to='/listcollection' >Collections</Link>
      <Link to='/listcoupon' >Coupons</Link>
      <Link to='/listproduct' >Products</Link>
      <Link to='/login' >Logout</Link>
    
    
    
    </div>
  );
};

export default Navbar;


