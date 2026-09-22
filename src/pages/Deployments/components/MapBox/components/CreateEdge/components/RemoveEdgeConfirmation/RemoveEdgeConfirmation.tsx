import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@app/components/Dialog/Dialog';
import React, { FC, ReactNode } from 'react';
import { deleteEdge, getEdgesMap, removeDrawingSpanPole, setSelectedEdgeId } from '@app/store/slices/edgesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@app/components/Button/Button';
import { DeleteEdgesResponse } from '@app/store/apis/edge/types';
import { DialogTitle } from '@radix-ui/react-dialog';

import { RootState } from '@app/store';

import { toast } from 'sonner';
import { useDeleteEdgesMutation } from '@app/store/apis/edge/edge';
import { getSelectedEdgeDetails } from '../../../../MapBox.utils';
import { API } from '@app/lib/api-config';
import { setPoles } from '@app/store/slices/polesSlice';

interface RemoveEdgeConfirmationDialogProps {
  triggerComponent: ReactNode;
  handleAction?: () => void;
}

const RemoveEdgeConfirmation: FC<RemoveEdgeConfirmationDialogProps> = ({ triggerComponent, handleAction }) => {
  const dispatch = useDispatch();
  const edgesMap = useSelector(getEdgesMap);
  const edgesList = useSelector((state: RootState) => state.edges.edgesList);
  const polesList = useSelector((state: RootState) => state.poles.polesList);
  const selectedEdgeId = useSelector((state: RootState) => state.edges.selectedEdgeId);

  const { selectedEdge } = getSelectedEdgeDetails(edgesMap, selectedEdgeId);

  const [deleteEdges, { isLoading }] = useDeleteEdgesMutation();

  const handleClear = () => {
    dispatch(deleteEdge(selectedEdgeId));
    dispatch(setSelectedEdgeId(-1));
  };

  const handleDeleteEdge = async () => {
    if (selectedEdge?.isNew) {
      const toPole = polesList.find(pole => pole.id === selectedEdge.to_pole_id);
      const fromPole = polesList.find(pole => pole.id === selectedEdge.from_pole_id);

      const toPoleLength =
        edgesList.filter(edge => edge.to_pole_id === toPole?.id || edge.from_pole_id === toPole?.id).length ?? 0;
      const fromPoleLength =
        edgesList.filter(edge => edge.from_pole_id === fromPole?.id || edge.to_pole_id === fromPole?.id).length ?? 0;

      if (toPole && toPoleLength === 1) dispatch(removeDrawingSpanPole(toPole));
      if (fromPole && fromPoleLength === 1) dispatch(removeDrawingSpanPole(fromPole));

      handleClear();
      return;
    }
    try {
      const resp = (await deleteEdges({
        selectedEdgeIds: [selectedEdgeId],
        skipInvalidation: true,
      })) as DeleteEdgesResponse;
      if (resp.error) {
        toast.error(resp?.error?.data?.detail ?? 'Error deleting span');
      } else {
        handleClear();
        const newEdge = edgesList.find(edge => selectedEdgeId === edge.id);
        if (newEdge) {
          const affectedPoleIds = [newEdge.from_pole_id, newEdge.to_pole_id];
          const poleResponses = await Promise.all(affectedPoleIds.map(id => API.get(`pole/${id}`)));
          const updatedPoles = polesList.map(pole => {
            const updatedData = poleResponses.find(res => res?.data?.data?.id === pole.id)?.data?.data;
            return updatedData ? { ...pole, ...updatedData } : pole;
          });
          dispatch(setPoles(updatedPoles));
        }
        dispatch(deleteEdge(selectedEdgeId));
        handleAction?.();
        toast.success('Span deleted successfully');
      }
    } catch (error_) {
      console.error('Error deleting edge:', error_);
      toast.error('Error deleting span');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Span</DialogTitle>
          <hr />
          <DialogDescription className="pt-4 font-mont text-sm text-black">
            Are you sure you want to remove this span?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end pt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" data-testid="remove-edge-cancel-btn">
              Cancel
            </Button>
          </DialogClose>
          <Button
            data-testid="remove-edge-confirmation-btn"
            loading={isLoading}
            type="button"
            variant="destructive"
            className="rounded bg-redShades-shade1"
            onClick={() => handleDeleteEdge()}>
            Remove Span
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveEdgeConfirmation;
