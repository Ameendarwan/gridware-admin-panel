import { FC } from 'react';
import { cn } from '@app/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  progressBgColor?: string;
}

const Progress: FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  showPercentage = false,
  progressBgColor = 'bg-primary',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className={cn('h-full transition-all duration-300 ease-out', progressBgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && <div className="mt-2 text-center text-sm text-stone-600">{Math.round(percentage)}%</div>}
      {showLabel && (
        <div className="mt-2 text-center text-sm text-stone-600">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

export default Progress;
