// src/Pages/Product.jsx
import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import Breadcrums from '../Components/Breadcrums/Breadcrums';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const { products } = useContext(ShopContext);
  const { productId } = useParams();
  const product = products?.find(p => p.id === Number(productId));

  const [size, setSize] = useState('');

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <Breadcrums product={product}/>
      <ProductDisplay product={product} setSize={setSize} size={size} />
      <DescriptionBox />
      <RelatedProducts />
    </div>
  );
}

export default Product;
