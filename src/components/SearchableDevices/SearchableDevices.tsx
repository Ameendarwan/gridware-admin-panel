import SearchableInfiniteSelect from '@app/components/SearchableInfiniteSelect';
import { memo } from 'react';

interface SearchableDevicesProps {
  value: string | string[] | null;
  onChange: (value: string) => void;
  mode?: string;
}

const SearchableDevices = ({ value, onChange, mode }: SearchableDevicesProps) => {
  return (
    <SearchableInfiniteSelect
      dataTestId="searchable-devices-input"
      multiSelect={true}
      fetchUrl="/device/all"
      responseMapper={item => ({
        value: `id:${item.id},serial_no:${item.serial_no},type:${item.type},solar_orientation:${item.solar_orientation},is_validated:false`,
        label: item.serial_no,
        serial_no: item.serial_no,
        type: item.type,
      })}
      renderOptionLabel={option => (
        <>
          {option.serial_no} - {option.type}
        </>
      )}
      placeholder="Select Device"
      value={value}
      onValueChange={selectedValue => {
        onChange(selectedValue);
      }}
      disabled={mode === 'view'}
    />
  );
};

export default memo(SearchableDevices);
