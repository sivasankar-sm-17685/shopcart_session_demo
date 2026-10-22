interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
  isDisabled?: boolean;
}

function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  className = '',
  isDisabled
}: QuantityStepperProps) {
  return (
    <div className={`quantity-stepper ${className}`}>
      <button
        type='button'
        className='quantity-stepper-button'
        onClick={onDecrement}
        aria-label='Decrease quantity'
        disabled={isDisabled}
      >
        −
      </button>
      <span className='quantity-stepper-value'>{quantity}</span>
      <button
        type='button'
        className='quantity-stepper-button'
        onClick={onIncrement}
        aria-label='Increase quantity'
        disabled={isDisabled}
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
