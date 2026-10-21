// External
import { Link } from 'react-router-dom';

// Context
import { useCart } from '../context/useCart';

interface NavBarProps {
  onSignOut: () => void;
}

function NavBar({ onSignOut }: NavBarProps) {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <nav className='nav-bar'>
      <span className='nav-brand'>Product Store</span>
      <Link to='/cart' className='nav-cart-link'>
        Cart <span className='nav-cart-badge'>{itemCount}</span>
      </Link>
      <button className='nav-sign-out' type='button' onClick={onSignOut}>
        Sign out
      </button>
    </nav>
  );
}

export default NavBar;
