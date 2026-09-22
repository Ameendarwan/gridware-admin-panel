import { Button } from '@app/components/Button/Button';
import { cn } from '@app/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { createQueryString } from '@app/components/DataTable/DataTable.utils';

export type LogicalOperator = 'and' | 'or';

interface DataTableLogicalOperatorProps {
  value: LogicalOperator;
  onChange: (value: LogicalOperator) => void;
}

const DataTableLogicalOperator = ({ value, onChange }: DataTableLogicalOperatorProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOperatorChange = (newOperator: LogicalOperator) => {
    onChange(newOperator);

    // Update URL params
    const newSearchParams = createQueryString({
      logical_operator: newOperator,
    });
    navigate(`${location.pathname}?${newSearchParams}`, { replace: true });
  };

  return (
    <div className="flex items-center space-x-1 px-1 py-2">
      <span className="text-xs text-muted-foreground mr-2">Logical Operator:</span>
      <div className="flex space-x-1 border rounded-md overflow-hidden">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={cn(
            'h-7 px-2 text-xs font-medium',
            value === 'and' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'
          )}
          onClick={() => handleOperatorChange('and')}>
          AND
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={cn(
            'h-7 px-2 text-xs font-medium',
            value === 'or' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'
          )}
          onClick={() => handleOperatorChange('or')}>
          OR
        </Button>
      </div>
    </div>
  );
};

export default DataTableLogicalOperator;