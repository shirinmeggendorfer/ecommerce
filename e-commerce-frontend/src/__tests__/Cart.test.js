import React from 'react';
import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react'; // Importiere 'act' aus 'react'
import { ShopProvider } from '../Context/ShopContext'; // Importiere 'ShopProvider'
import Cart from '../Pages/Cart';
import fetchMock from 'jest-fetch-mock'; // Importiere 'jest-fetch-mock'

// Mocken der abhängigen Komponenten
jest.mock('../Components/FakePaymentButton', () => ({ amount, onSuccess }) => (
  <button onClick={() => onSuccess({ success: true, message: 'Payment processed successfully' })}>
    Buy Now
  </button>
));
jest.mock('../Components/Loading/Loading.jsx', () => () => <div>Loading...</div>);

const mockProducts = [
  { id: 1, name: 'Product 1', new_price: '10.00', image: 'product1.jpg' },
  { id: 2, name: 'Product 2', new_price: '20.00', image: 'product2.jpg' }
];

const mockCartItems = {
  '1-S': 2,
  '2-M': 1
};

// Aktiviere das Fetch-Mocken
fetchMock.enableMocks();

const renderWithContext = (ui) => {
  return render(
    <Router>
      <ShopProvider value={{ products: mockProducts, cartItems: mockCartItems }}>
        {ui}
      </ShopProvider>
    </Router>
  );
};

describe('Cart component', () => {
  it('renders the Cart component with correct elements', () => {
    renderWithContext(<Cart />);

    expect(screen.getByText('Your Shopping Cart')).toBeInTheDocument();
    // Weitere Überprüfungen hier...
  });

  it('handles adding and removing items correctly', async () => {
    renderWithContext(<Cart />);

    // Simuliere die Interaktionen hier...
  });
/*
  it('handles successful payment', async () => {
    // Stubben des Fetch-Aufrufs
    fetchMock.mockResponseOnce(JSON.stringify({ success: true, message: 'Payment processed successfully' }));

    await act(async () => {
      renderWithContext(<Cart />);
    });

    const buyNowButton = screen.getByText('Buy Now');
    fireEvent.click(buyNowButton);
*/
    // Erhöhe die Timeout-Zeit auf 5000ms (5 Sekunden)
   // await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), { timeout: 10000 });

    // Überprüfe, ob das Element nicht mehr vorhanden ist
    //expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    // Überprüfe, ob die Zahlung erfolgreich war
   // expect(console.log).toHaveBeenCalledWith('Payment Success: { success: true, message: \'Payment processed successfully\' }');
  });
//});

