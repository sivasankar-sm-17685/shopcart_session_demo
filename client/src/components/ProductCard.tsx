interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  rating: number;
  thumbnail: string;
  category: string;
  id: number;
  onSelectProduct: (id: number) => void;
}
function ProductCard(props: ProductCardProps) {
  const {
    thumbnail,
    title,
    description,
    category,
    price,
    rating,
    id,
    onSelectProduct
  } = props;
  return (
    <div className='product-card' onClick={() => onSelectProduct(id)}>
      <img src={thumbnail} alt={title} className='product-thumbnail' />
      <p className='product-category'>{category}</p>
      <h3 className='product-title'>{title}</h3>
      <p className='product-description'>{description}</p>
      <p className='product-rating'>{rating}</p>
      <p className='product-price'>${price}</p>
    </div>
  );
}

export default ProductCard;
