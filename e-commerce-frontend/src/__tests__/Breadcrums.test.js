import React from 'react';
import { act } from 'react';
import { render, screen } from '@testing-library/react';
import Breadcrums from '../Components/Breadcrums/Breadcrums';
import arrow_icon from '../Components/Assets/breadcrum_arrow.png';

describe('Breadcrums component', () => {
    const product = {
      category: 'Electronics',
      name: 'Smartphone'
    };
  
    it('renders Breadcrums component with correct props', () => {
      act(() => {
        render(<Breadcrums product={product} />);
      });
  
      // Check that the breadcrumb text is rendered correctly
      expect(screen.getByText('HOME', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('SHOP', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Electronics', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Smartphone', { exact: false })).toBeInTheDocument();
  
      // Check that the arrow icon images are rendered correctly
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3); // There should be 3 arrow images
      images.forEach(img => {
        expect(img).toHaveAttribute('src', 'test-file-stub');
      });
    });
  });