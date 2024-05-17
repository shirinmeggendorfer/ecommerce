import React, { useContext, useState } from 'react'; // Hinzufügen von useState zum Import
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import Breadcrums from '../Components/Breadcrums/Breadcrums'; // Stellen Sie sicher, dass der Importname und die Verwendung übereinstimmen
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const { products } = useContext(ShopContext);
  const { productId } = useParams();
  const product = products.find(p => p.id === Number(productId));

  const [size, setSize] = useState(''); // Korrekt definiert


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
