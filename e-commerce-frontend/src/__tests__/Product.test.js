import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import Product from '../Pages/Product';
import '@testing-library/jest-dom/extend-expect'; // Ensure the correct import for jest-dom

// Mock data
const mockProducts = [
  { id: 1, name: 'Product 1', category: 'Category 1', image: 'product1.jpg' },
  { id: 2, name: 'Product 2', category: 'Category 2', image: 'product2.jpg' }
];

// Mock window.scrollTo
global.scrollTo = jest.fn();

describe('Product component', () => {
  it('renders product details correctly', async () => {
    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <MemoryRouter initialEntries={['/product/1']}>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Routes>
              <Route path="/product/:productId" element={<Product />} />
            </Routes>
          </ShopContext.Provider>
        </MemoryRouter>
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
        <MemoryRouter initialEntries={['/product/1']}>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Routes>
              <Route path="/product/:productId" element={<Product />} />
            </Routes>
          </ShopContext.Provider>
        </MemoryRouter>
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
        <MemoryRouter initialEntries={['/product/1']}>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Routes>
              <Route path="/product/:productId" element={<Product />} />
            </Routes>
          </ShopContext.Provider>
        </MemoryRouter>
      ));
    });

    // Check for the RelatedProducts component (assuming it contains some text)
    expect(getByText('Related Products')).toBeInTheDocument();
  });

  it('shows "Product not found" message when product does not exist', async () => {
    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <MemoryRouter initialEntries={['/product/999']}>
          <ShopContext.Provider value={{ products: mockProducts }}>
            <Routes>
              <Route path="/product/:productId" element={<Product />} />
            </Routes>
          </ShopContext.Provider>
        </MemoryRouter>
      ));
    });

    // Check for "Product not found" message
    expect(getByText('Product not found')).toBeInTheDocument();
  });
});
