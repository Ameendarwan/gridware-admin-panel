import SearchableInfiniteSelect from '@app/components/SearchableInfiniteSelect';
import { memo } from 'react';

interface SearchableDevicesProps {
  value: string | string[] | null;
  onChange: (value: string) => void;
  mode?: string;
}

const SearchableUsers = ({ value, onChange, mode }: SearchableDevicesProps) => {
  return (
    <SearchableInfiniteSelect
      dataTestId="searchable-users-input"
      multiSelect={true}
      fetchUrl="/user/all"
      responseMapper={item => ({
        value: item.id,
        label: item.id,
        id: item.id,
        email: item.email,
      })}
      renderOptionLabel={option => (
        <>
          {option.id} - {option.email}
        </>
      )}
      placeholder="Select Users"
      value={value}
      onValueChange={selectedValue => {
        onChange(selectedValue);
      }}
      disabled={mode === 'view'}
    />
  );
};

export default memo(SearchableUsers);
