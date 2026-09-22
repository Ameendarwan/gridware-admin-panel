import { ListChildComponentProps } from 'react-window';
import { Issue, Validation } from '@app/pages/Deployments/components/SideFilters/types';

export interface ErrorRowsProps extends ListChildComponentProps {
  data: {
    errors: Issue[];
    setIgnorableIssues: React.Dispatch<React.SetStateAction<string[]>>;
    setErrors: React.Dispatch<React.SetStateAction<Issue[] | undefined>>;
    selectedStage: Validation;
    setRowHeight: (index: number, height: number) => void;
  };
}
