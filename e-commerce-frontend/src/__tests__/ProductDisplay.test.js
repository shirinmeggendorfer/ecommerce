import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import { ShopContext } from '../Context/ShopContext';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  image: 'test-product.jpg',
};

const mockAddToCart = jest.fn();

const renderProductDisplay = () => {
  return render(
    <ShopContext.Provider value={{ addToCart: mockAddToCart }}>
      <Router>
        <ProductDisplay product={mockProduct} />
      </Router>
    </ShopContext.Provider>
  );
};

describe('ProductDisplay component', () => {
  it('renders ProductDisplay component with correct elements', () => {
    renderProductDisplay();

    // Check that the product name is rendered correctly
    expect(screen.getByText('Test Product')).toBeInTheDocument();

    // Check that the size options are rendered correctly
    ['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
      expect(screen.getByText(size)).toBeInTheDocument();
    });

    // Check that the add to cart button is rendered correctly
    expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
  });

  it('shows alert if size is not selected and add to cart is clicked', () => {
    renderProductDisplay();

    // Mock the alert function
    window.alert = jest.fn();

    // Click the add to cart button without selecting a size
    fireEvent.click(screen.getByText('ADD TO CART'));

    // Check that the alert was called
    expect(window.alert).toHaveBeenCalledWith('Please select a size.');
  });

  it('calls addToCart with correct arguments when size is selected and add to cart is clicked', () => {
    renderProductDisplay();

    // Select a size
    fireEvent.click(screen.getByText('M'));

    // Click the add to cart button
    fireEvent.click(screen.getByText('ADD TO CART'));

    // Check that addToCart was called with the correct arguments
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id, 'M');
  });
});
