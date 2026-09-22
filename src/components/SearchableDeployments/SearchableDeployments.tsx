import SearchableInfiniteSelect from '@app/components/SearchableInfiniteSelect';
import { memo } from 'react';

interface SearchableDeploymentsProps {
  value: string | null;
  onChange: (value: string) => void;
  mode?: string;
}

const SearchableDeployments = ({ value, onChange, mode }: SearchableDeploymentsProps) => {
  return (
    <SearchableInfiniteSelect
      dataTestId="searchable-deployments-input"
      fetchUrl="/deployment/all"
      responseMapper={item => ({
        value: item.id,
        label: item.name,
        name: item.name,
        location: item.location,
      })}
      renderOptionLabel={option => (
        <>
          <b>Name:</b> {option.name} - <b>Location:</b> {option.location}
        </>
      )}
      placeholder="Select Deployment"
      value={value}
      onValueChange={selectedValue => {
        onChange(selectedValue);
      }}
      disabled={mode === 'view'}
    />
  );
};

export default memo(SearchableDeployments);
