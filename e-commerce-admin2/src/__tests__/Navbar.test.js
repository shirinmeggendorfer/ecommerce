import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Components/Navbar/Navbar'; // Passe den Pfad entsprechend deiner Projektstruktur an
import nav_dropdown from '../Assets/nav_dropdown.png'; // Passe den Pfad entsprechend deiner Projektstruktur an

test('renders Navbar with links and dropdown image', () => {
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

  // Überprüfen, ob das Dropdown-Bild gerendert wird
  const dropdownImg = screen.getByAltText('');
  expect(dropdownImg).toBeInTheDocument();
  expect(dropdownImg).toHaveAttribute('src', nav_dropdown);

  // Überprüfen, ob die Links gerendert werden
  const categoriesLink = screen.getByText('Categories');
  expect(categoriesLink).toBeInTheDocument();
  expect(categoriesLink.closest('a')).toHaveAttribute('href', '/listcategory');

  const collectionsLink = screen.getByText('Collections');
  expect(collectionsLink).toBeInTheDocument();
  expect(collectionsLink.closest('a')).toHaveAttribute('href', '/listcollection');

  const couponsLink = screen.getByText('Coupons');
  expect(couponsLink).toBeInTheDocument();
  expect(couponsLink.closest('a')).toHaveAttribute('href', '/listcoupon');

  const productsLink = screen.getByText('Products');
  expect(productsLink).toBeInTheDocument();
  expect(productsLink.closest('a')).toHaveAttribute('href', '/listproduct');

  const logoutLink = screen.getByText('Logout');
  expect(logoutLink).toBeInTheDocument();
  expect(logoutLink.closest('a')).toHaveAttribute('href', '/login');
});
