// src/__tests__/Product.test.js
import React from 'react';
import { render, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import Product from '../Pages/Product';
import '@testing-library/jest-dom';

// Mock data
const mockProducts = [
  { id: 1, name: 'Product 1', category: 'Category 1', image: 'product1.jpg' },
  { id: 2, name: 'Product 2', category: 'Category 2', image: 'product2.jpg' }
];

// Mock useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    productId: '1' // Set this to match one of the mock product IDs
  })
}));

// Mock window.scrollTo
global.scrollTo = jest.fn();

describe('Product component', () => {
  it('renders product details correctly', async () => {
    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <Router>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Product />
          </ShopContext.Provider>
        </Router>
      ));
    });

    // Check for product name and category
    expect(getByText('Product 1')).toBeInTheDocument();
    expect(getByText('Category 1')).toBeInTheDocument();
  });

  it('renders product description box', async () => {
    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <Router>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Product />
          </ShopContext.Provider>
        </Router>
      ));
    });

    // Check for the DescriptionBox component with a more flexible matcher
    expect(getByText((content, element) => {
      return content.includes('An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet.');
    })).toBeInTheDocument();
  });

  it('renders related products section', async () => {
    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <Router>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Product />
          </ShopContext.Provider>
        </Router>
      ));
    });

    // Check for the RelatedProducts component (assuming it contains some text)
    expect(getByText('Related Products')).toBeInTheDocument();
  });
});
