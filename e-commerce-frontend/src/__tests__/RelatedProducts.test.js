import React from 'react';
import { render, screen, act } from '@testing-library/react';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';
import Item from '../Components/Item/Item';
import data_product from '../Components/Assets/data';

jest.mock('../Components/Item/Item', () => {
  return function MockItem({ name, image, new_price, old_price }) {
    return (
      <div data-testid="item">
        <p>{name}</p>
        <img src={image} alt={name} />
        <p>{new_price}</p>
        <p>{old_price}</p>
      </div>
    );
  };
});

describe('RelatedProducts component', () => {
  it('renders RelatedProducts component with correct elements and items', () => {
    act(() => {
      render(<RelatedProducts />);
    });

    // Check that the heading and hr are rendered correctly
    expect(screen.getByText('Related Products')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();

    // Check that the items are rendered correctly
    const items = screen.getAllByTestId('item');
    expect(items).toHaveLength(data_product.length);

    // Check the content of each item
    data_product.forEach((item) => {
      const nameElements = screen.getAllByText(item.name);
      expect(nameElements.length).toBeGreaterThanOrEqual(1);

      const newPriceElements = screen.getAllByText(item.new_price.toString());
      expect(newPriceElements.length).toBeGreaterThanOrEqual(1);

      const oldPriceElements = screen.getAllByText(item.old_price.toString());
      expect(oldPriceElements.length).toBeGreaterThanOrEqual(1);

      const imgElements = screen.getAllByAltText(item.name);
      expect(imgElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
