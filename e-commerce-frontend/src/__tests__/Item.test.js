// frontend/tests/Item.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Item from '../Components/Item/Item';
/*
describe('Item component', () => {
  const props = {
    id: '1',
    image: 'test.jpg',
    name: 'Test Product',
    new_price: '9.99',
    old_price: '19.99'
  };

  it('renders Item component with correct props', () => {
    render(
      <Router>
        <Item {...props} />
      </Router>
    );

    // Check that the image is rendered correctly
    const imgElement = screen.getByAltText('products');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'http://localhost:4000/images/test.jpg');

    // Check that the product name is rendered
    const nameElement = screen.getByText('Test Product');
    expect(nameElement).toBeInTheDocument();

    // Check that the new price is rendered correctly
    const newPriceElement = screen.getByText('$9.99');
    expect(newPriceElement).toBeInTheDocument();

    // Check that the old price is rendered correctly
    const oldPriceElement = screen.getByText('$19.99');
    expect(oldPriceElement).toBeInTheDocument();

    // Check that the link is correct
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/product/1');
  });
});
*/
describe('Item component', () => {
  beforeAll(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  it('renders Item component with correct props', () => {
    const props = { id: 1, image: 'image.png', name: 'Item Name' };

    render(
      <Router>
        <Item {...props} />
      </Router>
    );

    // Check that the item is rendered correctly
    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByAltText('products')).toBeInTheDocument();
  });
});