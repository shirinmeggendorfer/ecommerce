import React from 'react';
import { render, screen } from '@testing-library/react';
import NewCollections from '../Components/NewCollections/NewCollections';
import Item from '../Components/Item/Item';

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

describe('NewCollections component', () => {
  const mockData = [
    { id: 1, name: 'Item 1', image: 'item1.jpg', new_price: '10.00', old_price: '15.00' },
    { id: 2, name: 'Item 2', image: 'item2.jpg', new_price: '20.00', old_price: '25.00' }
  ];

  it('renders NewCollections component with correct elements and items', () => {
    render(<NewCollections data={mockData} />);

    // Check that the heading and hr are rendered correctly
    expect(screen.getByText('NEW COLLECTIONS')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();

    // Check that the items are rendered correctly
    const items = screen.getAllByTestId('item');
    expect(items).toHaveLength(2);

    // Check the content of each item
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('10.00')).toBeInTheDocument();
    expect(screen.getByText('15.00')).toBeInTheDocument();
    expect(screen.getByAltText('Item 1')).toBeInTheDocument();

    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('20.00')).toBeInTheDocument();
    expect(screen.getByText('25.00')).toBeInTheDocument();
    expect(screen.getByAltText('Item 2')).toBeInTheDocument();
  });
});
