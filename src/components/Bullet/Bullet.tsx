import { FC, ButtonHTMLAttributes, ReactNode } from 'react';

interface BulletProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  color?: string;
}

const Bullet: FC<BulletProps> = ({ children, color, disabled, ...props }) => {
  return (
    <button
      data-testid="bullet"
      type="button"
      {...props}
      disabled={disabled}
      className={`flex aspect-square h-[18px] w-[18px] items-center justify-center rounded-full ${props.className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{ backgroundColor: color }}>
      {children}
    </button>
  );
};

export default Bullet;
