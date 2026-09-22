import { Pole } from '@app/store/apis/pole/types';

export interface EditPoleProps {
  pole: Pole | null;
  handleEditPole: () => void;
}
