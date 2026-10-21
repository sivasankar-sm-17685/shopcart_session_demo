// External
import { Route, Routes } from 'react-router-dom';

// Hooks
import { useToast } from './hooks/useToast';

// Components
import ProductDetail from './components/ProductDetail';
import ProtectedRoute from './components/ProtectedRoute';
import ToastStack from './components/ToastStack';

// Features
import AuthCard from './features/auth/AuthCard';
import CartList from './features/Cart/CartList';
import ProductList from './features/Products/ProductsList';

// CSS
import './App.css';

function App() {
  const { toastList, showToast, closeToast } = useToast();
  return (
    <>
      <Routes>
        <Route path='/' element={<AuthCard showToast={showToast} />}></Route>
        <Route element={<ProtectedRoute />}>
          <Route path='/products' element={<ProductList />}></Route>
          <Route
            path='/products/:id'
            element={<ProductDetail showToast={showToast} />}
          ></Route>
          <Route path='/cart' element={<CartList />}></Route>
        </Route>
      </Routes>
      <ToastStack onClose={closeToast} toastList={toastList} />
    </>
  );
}

export default App;
