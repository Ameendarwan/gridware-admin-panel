import SearchableInfiniteSelect from '@app/components/SearchableInfiniteSelect';
import { memo } from 'react';

interface SearchableDevicesProps {
  value: string | string[] | null;
  onChange: (value: string) => void;
  mode?: string;
}

const SearchableCustomers = ({ value, onChange, mode }: SearchableDevicesProps) => {
  return (
    <SearchableInfiniteSelect
      dataTestId="searchable-customers-input"
      fetchUrl="/customer/all"
      responseMapper={item => ({
        value: item.id,
        label: item.id,
        id: item.id,
        name: item.name,
      })}
      renderOptionLabel={option => (
        <>
          {option.id} - {option.name}
        </>
      )}
      placeholder="Select Customer"
      value={value}
      onValueChange={selectedValue => {
        onChange(selectedValue);
      }}
      disabled={mode === 'view'}
    />
  );
};

export default memo(SearchableCustomers);
