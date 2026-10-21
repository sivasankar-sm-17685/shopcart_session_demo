// External
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Types
import type { ToastType } from '../types/toast';

// Context
import { useCart } from '../context/useCart';

// Hooks
import { useProductDetail } from '../hooks/useProductDetail';

// Components
import PageLoader from './PageLoader';
import QuantityStepper from './QuantityStepper';

interface ProductDetailProps {
  showToast: (
    status: ToastType['status'],
    message: ToastType['message']
  ) => void;
}
export default function ProductDetail(props: ProductDetailProps) {
  const { showToast } = props;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { productDetail, isLoading, error } = useProductDetail(Number(id));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      showToast('failure', error);
      navigate('/products');
    }
  }, [error, showToast, navigate]);

  useEffect(() => {
    if (productDetail) {
      setSelectedImage(productDetail.thumbnail);
    }
  }, [productDetail]);

  if (isLoading) {
    return <PageLoader message='Fetching the product details...' />;
  }

  const cartItem = productDetail
    ? items.find((item) => item.id === productDetail.id)
    : undefined;
  const cartQuantity = cartItem?.quantity ?? 0;

  const onDecrementQuantity = () => {
    if (!productDetail) return;
    if (cartQuantity <= 1) {
      removeItem(productDetail.id);
    } else {
      updateQuantity(productDetail.id, cartQuantity - 1);
    }
  };

  return productDetail ? (
    <div className='product-detail'>
      <button className='product-detail-back' onClick={() => navigate(-1)}>
        ← Back to products
      </button>
      <div>
        <img
          className='product-detail-image'
          src={selectedImage ?? productDetail.thumbnail}
          alt={productDetail.title}
        />
        <div className='product-detail-gallery'>
          {productDetail.images.slice(0, 4).map((image) => (
            <img
              key={image}
              src={image}
              alt=''
              className={`product-detail-thumb ${
                image === selectedImage ? 'selected' : ''
              }`}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      </div>
      <div className='product-detail-info'>
        <p className='product-detail-category'>{productDetail.category}</p>
        <p className='product-detail-brand'>{productDetail.brand}</p>
        <h1 className='product-detail-title'>{productDetail.title}</h1>
        <p className='product-detail-rating'>{productDetail.rating}</p>
        <p className='product-detail-description'>
          {productDetail.description}
        </p>

        <div className='product-detail-price-row'>
          <p className='product-detail-price'>
            ${productDetail.price.toFixed(2)}
          </p>
          {productDetail.discountPercentage > 0 && (
            <>
              <span className='product-detail-original-price'>
                $
                {(
                  productDetail.price /
                  (1 - productDetail.discountPercentage / 100)
                ).toFixed(2)}
              </span>
              <span className='product-detail-discount-badge'>
                -{Math.round(productDetail.discountPercentage)}%
              </span>
            </>
          )}
        </div>

        <p
          className={`product-detail-stock ${
            productDetail.availabilityStatus === 'In Stock'
              ? 'in-stock'
              : 'out-of-stock'
          }`}
        >
          {productDetail.availabilityStatus} · {productDetail.stock} left
        </p>

        {cartQuantity === 0 ? (
          <button
            className='product-detail-add-to-cart'
            disabled={productDetail.availabilityStatus !== 'In Stock'}
            onClick={() => {
              addItem({
                id: productDetail.id,
                price: productDetail.price,
                title: productDetail.title,
                thumbnail: productDetail.thumbnail
              });
            }}
          >
            Add to cart
          </button>
        ) : (
          <QuantityStepper
            className='product-detail-quantity-stepper'
            quantity={cartQuantity}
            onIncrement={() =>
              updateQuantity(productDetail.id, cartQuantity + 1)
            }
            onDecrement={onDecrementQuantity}
          />
        )}

        <div className='product-detail-policies'>
          <p>
            <strong>Warranty:</strong> {productDetail.warrantyInformation}
          </p>
          <p>
            <strong>Shipping:</strong> {productDetail.shippingInformation}
          </p>
          <p>
            <strong>Returns:</strong> {productDetail.returnPolicy}
          </p>
        </div>
      </div>
    </div>
  ) : null;
}
