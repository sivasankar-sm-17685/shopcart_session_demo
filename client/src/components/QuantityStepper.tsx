interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
}

function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  className = ''
}: QuantityStepperProps) {
  return (
    <div className={`quantity-stepper ${className}`}>
      <button
        type='button'
        className='quantity-stepper-button'
        onClick={onDecrement}
        aria-label='Decrease quantity'
      >
        −
      </button>
      <span className='quantity-stepper-value'>{quantity}</span>
      <button
        type='button'
        className='quantity-stepper-button'
        onClick={onIncrement}
        aria-label='Increase quantity'
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
