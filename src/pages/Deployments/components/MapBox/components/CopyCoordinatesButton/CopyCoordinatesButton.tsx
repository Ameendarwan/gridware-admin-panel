import { FC } from 'react';
import { Button } from '@app/components/Button/Button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

type CoordinateValue = number | string | undefined;

interface CopyCoordinatesButtonProps {
  lat: CoordinateValue;
  long: CoordinateValue;
  className?: string;
}

const copyCoordinatesToClipboard = (lat: CoordinateValue, long: CoordinateValue) => {
  const coordinates = `${lat},${long}`;
  navigator.clipboard
    .writeText(coordinates)
    .then(() => {
      toast.success('Coordinates copied to clipboard');
    })
    .catch(() => {
      toast.error('Failed to copy coordinates');
    });
};

const CopyCoordinatesButton: FC<CopyCoordinatesButtonProps> = ({ lat, long, className = '' }) => {
  const handleClick = () => {
    copyCoordinatesToClipboard(lat, long);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`h-8 w-8 p-0 hover:bg-grayShades-shade3 ${className}`}
      title="Copy coordinates">
      <Copy className="h-4 w-4" />
    </Button>
  );
};

export default CopyCoordinatesButton;
