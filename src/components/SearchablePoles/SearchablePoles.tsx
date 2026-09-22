import SearchableInfiniteSelect from '@app/components/SearchableInfiniteSelect';
import { memo } from 'react';

interface SearchablePolesProps {
  value: string | null;
  onChange: (value: string) => void;
  mode?: string;
}

const SearchablePoles = ({ value, onChange, mode }: SearchablePolesProps) => {
  return (
    <SearchableInfiniteSelect
      dataTestId="searchable-poles-input"
      fetchUrl="/pole/all"
      responseMapper={item => ({
        value: item.id,
        label: item.pole_id,
        pole_id: item.pole_id,
        status: item.status,
      })}
      renderOptionLabel={option => (
        <>
          <b>Pole:</b> {option.pole_id} - <b>Status:</b> {option.status}
        </>
      )}
      placeholder="Select Pole"
      value={value}
      onValueChange={selectedValue => {
        onChange(selectedValue);
      }}
      disabled={mode === 'view'}
    />
  );
};

export default memo(SearchablePoles);
