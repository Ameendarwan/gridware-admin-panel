import { FC } from 'react';
import { IconProps, icons } from '@app/components/SVGIcon/SVGIcon.utils';

const SVGIcon: FC<IconProps> = ({ onClick, icon, width, height, color, className, stroke, strokeWidth }) => {
  const IconComponent = icons[icon];

  if (!IconComponent) return null;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex cursor-pointer border-0 bg-transparent p-0"
        aria-label={`${icon} icon button`}>
        {IconComponent({ width, height, color, className, stroke, strokeWidth })}
      </button>
    );
  }

  return <span>{IconComponent({ width, height, color, className, stroke, strokeWidth })}</span>;
};

export default SVGIcon;
