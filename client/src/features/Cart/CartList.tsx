// External
import { useNavigate } from 'react-router-dom';

// Types
import type { CartItem } from '../../types/cart';

// Context
import { useCart } from '../../context/useCart';

// Components
import QuantityStepper from '../../components/QuantityStepper';

function CartList() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const onGoToProductListPage = () => {
    navigate('/products');
  };

  const removeSelectedItem = (id: CartItem['id']) => {
    removeItem(id);
  };

  const onDecrementQuantity = (item: CartItem) => {
    if (item.quantity <= 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return items.length === 0 ? (
    <div className='cart-empty'>
      <p className='cart-empty-message'>
        No items have been added yet, add one to checkout
      </p>
      <button className='cart-browse-button' onClick={onGoToProductListPage}>
        Search Products
      </button>
    </div>
  ) : (
    <div className='cart-page'>
      <button className='back-link' onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className='cart-page-title'>Your Cart</h1>
      <div className='cart-items'>
        {items.map((item) => (
          <div key={item.id} className='cart-row'>
            <img src={item.thumbnail} alt={item.title} className='cart-thumb' />
            <p className='cart-item-title'>{item.title}</p>
            <QuantityStepper
              quantity={item.quantity}
              onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
              onDecrement={() => onDecrementQuantity(item)}
            />
            <p className='cart-item-price'>
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <button
              className='cart-remove-button'
              onClick={() => removeSelectedItem(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className='cart-summary'>
        <p className='cart-total'>Total: ${total.toFixed(2)}</p>
        <button className='cart-clear-button' onClick={clearCart}>
          Clear cart
        </button>
      </div>
    </div>
  );
}

export default CartList;
