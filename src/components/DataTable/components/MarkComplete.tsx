import ConfirmationDialog from '@app/components/ConfirmationDialog/ConfirmationDialog';
import { Button } from '@app/components/Button/Button';
import { SetURLSearchParams } from 'react-router-dom';
import { API } from '@app/lib/api-config';
import { toast } from 'sonner';

const markCompleteHandler = async (id: string, setSearchParams?: SetURLSearchParams) => {
  try {
    await API.patch(`/status/bulk-update`, {
      status_ids: [id],
    });
    setSearchParams?.(() => {
      const updatedParams = new URLSearchParams(globalThis.location.search);
      updatedParams.set('updated_batch_id', id);
      return updatedParams;
    });
    toast.success('Record updated successfully');
  } catch (error: any) {
    console.error('Error during update operation:', error);
    toast.error(error?.response?.data?.detail ?? 'Error updating record');
  }
};

const MarkComplete = ({
  id,
  setSearchParams,
  isCompleted,
}: {
  id: string;
  setSearchParams?: SetURLSearchParams;
  isCompleted?: boolean;
}) =>
  !isCompleted && (
    <ConfirmationDialog
      description="Do you want to mark this record as completed?"
      triggerComponent={
        <span className="group relative cursor-pointer text-accent" title="Mark as complete">
          <i className="fa-solid fa-circle-check" />
        </span>
      }
      confirmationComponent={
        <Button
          type="button"
          className="rounded bg-greenShades-shade1"
          onClick={async () => await markCompleteHandler(id, setSearchParams)}>
          Yes, proceed
        </Button>
      }
    />
  );

export default MarkComplete;
