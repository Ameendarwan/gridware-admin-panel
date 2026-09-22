import Bullet from '@app/components/Bullet';
import { FC } from 'react';
import { QuantitySelectorProps } from '../../types';
import SVGIcon from '@app/components/SVGIcon';

const QuantitySelector: FC<QuantitySelectorProps> = ({
  value,
  leftIcon,
  rightIcon,
  className,
  onChange,
  disabled,
  incrementDisabled,
  decrementDisabled,
}) => {
  const handleDecrement = () => {
    if (value > 1 && onChange && !disabled && !decrementDisabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (onChange && !disabled && value < 9) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between">
      <Bullet
        data-testid="decrement-btn"
        className={`!h-6 !w-6 rounded-md bg-white ${className} ${decrementDisabled && '!cursor-not-allowed'}`}
        onClick={handleDecrement}
        disabled={disabled || decrementDisabled}>
        <SVGIcon icon={leftIcon} height={10} width={10} />
      </Bullet>

      <span className="min-w-6 text-center !text-xs text-[#2D2D2D]">{value}</span>

      <Bullet
        className={`!h-6 !w-6 rounded-md bg-white ${className}`}
        onClick={handleIncrement}
        disabled={disabled || incrementDisabled}
        data-testid="increment-btn">
        <SVGIcon icon={rightIcon} height={10} width={10} />
      </Bullet>
    </div>
  );
};

export default QuantitySelector;
