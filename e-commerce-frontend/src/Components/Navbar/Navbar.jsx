import React, { useContext, useRef, useState } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = () => {
  let [menu, setMenu] = useState("shop");
  const { getTotalCartItems, setCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const navigate = useNavigate();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  };

  const handleLogout = async () => {
    const response = await fetch('http://localhost:4001/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("auth-token")}`
      }
    });
    if (response.ok) {
      localStorage.removeItem('auth-token');
      if (typeof setCartItems === 'function') {
        setCartItems({});
      } else {
        console.error('setCartItems is not a function');
      }
      navigate("/");
    }
  };

  return (
    <div className='nav'>
      <Link to='/' onClick={() => { setMenu("shop") }} className="nav-logo">
        <img src={logo} alt="logo" />
        <p>Get Your Need</p>
      </Link>
      <img onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => { setMenu("shop") }}><Link to='/' >Shop</Link>{menu === "shop" ? <hr /> : null}</li>
        <li onClick={() => { setMenu("mens") }}><Link to='/mens' >Men</Link>{menu === "mens" ? <hr /> : null}</li>
        <li onClick={() => { setMenu("womens") }}><Link to='/womens' >Women</Link>{menu === "womens" ? <hr /> : null}</li>
        <li onClick={() => { setMenu("kids") }}><Link to='/kids' >Kids</Link>{menu === "kids" ? <hr /> : null}</li>
      </ul>
      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to='/login'><button>Login</button></Link>
        )}
        <Link to={localStorage.getItem('auth-token') ? "/cart" : "/login"}>
          <img src={cart_icon} alt="Cart" />
          <div className="nav-cart-count">{getTotalCartItems()}</div>
        </Link>
      </div>
    </div>
  )
}

export default Navbar;
