// Hooks
import { useProducts } from '../../hooks/useProducts';

// Components
import PageLoader from '../../components/PageLoader';
import ProductCard from '../../components/ProductCard';

function ProductList() {
  const { products, error, isLoading, onSelectProduct } = useProducts();

  if (isLoading) {
    return <PageLoader message='Fetching products...' />;
  }

  if (error) {
    return <p className='auth-error'>{error}</p>;
  }
  return (
    <div className='product-grid'>
      {products.map((product) => {
        return (
          <ProductCard
            key={product.id}
            id={product.id}
            onSelectProduct={onSelectProduct}
            title={product.title}
            description={product.description}
            thumbnail={product.thumbnail}
            price={product.price}
            rating={product.rating}
            category={product.category}
          />
        );
      })}
    </div>
  );
}

export default ProductList;
