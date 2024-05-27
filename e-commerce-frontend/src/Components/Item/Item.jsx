import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

const Item = (props) => {
  return (
    <div className='item'>
      <Link to={`/product/${props.id}`} style={{ textDecoration: 'none' }}><img onClick={window.scrollTo(0, 0)} src={`http://localhost:4000${props.image}`} alt="products" />
</Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">${parseFloat(props.new_price).toFixed(2)}</div> 
        <div className="item-price-old">${parseFloat(props.old_price).toFixed(2)}</div>

      </div>
    </div>
  )
}

export default Item