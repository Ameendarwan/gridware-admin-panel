/**
 * Reusable column renderer components for DataTable
 * Reduces duplication across page column definitions
 */

import { Link } from 'react-router-dom';
import { Badge } from '@app/components/Badge/Badge';
import SVGIcon from '@app/components/SVGIcon';

/**
 * Renders device badges with links
 * @param devices - Array of devices
 * @param accessor - Function to extract the value to display from each device
 * @returns JSX element with device badges
 */
export const renderDeviceBadges = <T,>(devices: T[], accessor: (device: T) => string | boolean) => (
  <span className="flex gap-x-2">
    {devices?.map((device: any) => (
      <Link to={`/devices/${device.id}/view`} key={device.serial_no || device.id}>
        <Badge variant="outline" className="cursor-pointer bg-[#e8f0f9] p-2 text-secondary">
          {accessor(device)}
        </Badge>
      </Link>
    ))}
  </span>
);

/**
 * Renders a boolean value as a check or cross icon
 * @param value - Boolean value to render
 * @returns JSX element with check or cross icon
 */
export const renderBooleanIcon = (value: boolean | undefined) => (
  <span>
    {value ? (
      <SVGIcon icon={'check-circle'} width={20} height={20} color="fill-success" />
    ) : (
      <SVGIcon icon={'cross-circle'} width={20} height={20} color="fill-destructive" />
    )}
  </span>
);

/**
 * Renders an array of values as a comma-separated list
 * @param values - Array of values
 * @returns JSX element with comma-separated values
 */
export const renderArrayValues = (values: string[] | undefined) => (
  <span className="flex gap-x-2 whitespace-pre-wrap">{values?.join(', ')}</span>
);
