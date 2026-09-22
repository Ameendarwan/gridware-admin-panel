import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';
import { Edge, MapMode } from '@app/pages/Deployments/components/MapBox/types';
import React, { useEffect, useState } from 'react';
import {
  clearDrawingSpanPoles,
  removeDrawingSpanPole,
  setEdges,
  setIsDuplicateEdge,
  setIsSelectingFromPole,
  setMode,
  setSelectedEdgeId,
  setSelectedFromPole,
  setSelectedToPole,
} from '@app/store/slices/edgesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@app/components/Button/Button';

import { RootState } from '@app/store';
import SVGIcon from '@app/components/SVGIcon';
import { toast } from 'sonner';
import { useCreateBulkEdgesMutation } from '@app/store/apis/edge/edge';

import { API } from '@app/lib/api-config';
import { setPoles } from '@app/store/slices/polesSlice';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import RemoveEdgeConfirmation from './components/RemoveEdgeConfirmation/RemoveEdgeConfirmation';

const CreateEdge = () => {
  const dispatch = useDispatch();
  const [createBulkEdges, { isLoading }] = useCreateBulkEdgesMutation();

  const drawingSpanPoles = useSelector((state: RootState) => state.edges.drawingSpanPoles);
  const deploymentId = useSelector((state: RootState) => state.edges.deploymentId);
  const edgesList = useSelector((state: RootState) => state.edges.edgesList);
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const selectedEdgeId = useSelector((state: RootState) => state.edges.selectedEdgeId);

  const [isCreateEdgeActive, setIsCreateEdgeActive] = useState(false);

  const newEdges = edgesList.filter(edge => edge.isNew);
  const realEdges = edgesList.filter(edge => !edge.isNew);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedChanges = newEdges?.length > 1;
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    globalThis.addEventListener('beforeunload', handleBeforeUnload);
    return () => globalThis.removeEventListener('beforeunload', handleBeforeUnload);
  }, [edgesList]);

  useEffect(() => {
    const newEdges: Edge[] = [];

    for (let i = 0; i < (drawingSpanPoles?.length ?? 0) - 1; i++) {
      const fromPole = drawingSpanPoles?.[i];
      const toPole = drawingSpanPoles?.[i + 1];

      if (toPole && fromPole?.id === toPole?.id) {
        toast.error(`Self-loop detected at pole (${toPole.pole_id}), cannot connect to itself`);
        dispatch(removeDrawingSpanPole(toPole));
        return;
      }

      const edgeAlreadyExists = edgesList.some(
        edge =>
          !edge.isNew &&
          fromPole &&
          toPole &&
          ((edge.from_pole_id === fromPole.id && edge.to_pole_id === toPole.id) ||
            (edge.from_pole_id === toPole.id && edge.to_pole_id === fromPole.id))
      );

      const newEdgeAlreadyExists = newEdges.some(
        edge =>
          fromPole &&
          toPole &&
          ((edge.from_pole_id === fromPole.id && edge.to_pole_id === toPole.id) ||
            (edge.from_pole_id === toPole.id && edge.to_pole_id === fromPole.id))
      );

      if (edgeAlreadyExists || newEdgeAlreadyExists) {
        dispatch(setIsDuplicateEdge(true));
        toast.error('Span already exists between the selected poles. Please select a different pole.');
        // Remove the duplicate pole and keep the selection on the previous pole

        dispatch(removeDrawingSpanPole(null));

        return; // exit early to prevent creating any new edges
      }

      if (!fromPole || !toPole) continue;

      const edge: Edge = {
        id: Date.now() + i,
        color: '#FFFF00',
        deployment_id: deploymentId ?? 0,
        from_pole_id: fromPole?.id ?? 0,
        to_pole_id: toPole?.id ?? 0,
        spans: [],
        isNew: true,
      };

      newEdges.push(edge);
    }

    // Set isDuplicateEdge to false if no duplicates were found (we only reach here if loop completes without early return)
    dispatch(setIsDuplicateEdge(false));

    const combinedEdges = [...realEdges, ...newEdges];
    dispatch(setEdges(combinedEdges));
  }, [drawingSpanPoles, deploymentId, dispatch]);

  const defaultPoleSelection = () => {
    dispatch(setSelectedFromPole(0));
    dispatch(setSelectedToPole(0));
  };

  const handleSaveCreateEdge = async () => {
    if (!deploymentId || edgesList.length === 0 || newEdges.length === 0) return;

    try {
      const isAnyDuplicate = newEdges.some(newEdge =>
        realEdges.some(
          existing =>
            (existing.from_pole_id === newEdge.from_pole_id && existing.to_pole_id === newEdge.to_pole_id) ||
            (existing.from_pole_id === newEdge.to_pole_id && existing.to_pole_id === newEdge.from_pole_id)
        )
      );

      if (isAnyDuplicate) {
        return toast.error('One or more spans already exist between the selected poles');
      }

      const result = (await createBulkEdges({ edges: newEdges, skipInvalidation: true })) as any;

      if (result?.error) {
        toast.error(result?.error?.data?.detail ?? 'Failed to create spans');
        return;
      }

      const addedEdges = result?.data?.data ?? [];

      if (addedEdges?.length) {
        toast.success('Spans created successfully');

        const updatedEdges = [...realEdges, ...addedEdges];
        dispatch(setEdges(updatedEdges));
        defaultPoleSelection();
        setIsCreateEdgeActive(false);
        dispatch(clearDrawingSpanPoles());

        // Optionally fetch updated pole data for affected poles
        const affectedPoleIds = Array.from(
          new Set(
            addedEdges.flatMap((edge: { from_pole_id: any; to_pole_id: any }) => [edge.from_pole_id, edge.to_pole_id])
          )
        );
        const poleResponses = await Promise.all(affectedPoleIds.map(id => API.get(`pole/${id}`)));
        const updatedPoles = poles.map(pole => {
          const updatedData = poleResponses.find(res => res?.data?.data?.id === pole.id)?.data?.data;
          return updatedData ? { ...pole, ...updatedData } : pole;
        });
        dispatch(setPoles(updatedPoles));
        dispatch(setMode(MapMode.NOVIEW));
      } else {
        dispatch(clearDrawingSpanPoles());
        toast.error('No spans were created');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMode = () => {
    if (newEdges?.length) {
      const confirmed = globalThis.confirm('You have unsaved spans. Are you sure you want to leave?');
      if (confirmed) {
        dispatch(setEdges(realEdges));
        dispatch(clearDrawingSpanPoles());
        setIsCreateEdgeActive(false);
      }
    } else {
      dispatch(setIsSelectingFromPole(!isCreateEdgeActive));
      defaultPoleSelection();
      dispatch(clearDrawingSpanPoles());
      dispatch(setMode(isCreateEdgeActive ? MapMode.NOVIEW : MapMode.CREATEEDGE));
      setIsCreateEdgeActive(prev => !prev);
    }
  };

  const handleUndo = () => {
    if (drawingSpanPoles?.length === 1) dispatch(setEdges(realEdges));
    dispatch(removeDrawingSpanPole(null));
  };

  const handleCancel = () => {
    setIsCreateEdgeActive(false);
    dispatch(setSelectedEdgeId(0));
  };

  const handleAction = () => {
    dispatch(clearDrawingSpanPoles());
    setIsCreateEdgeActive(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={isCreateEdgeActive ? '!bg-secondary' : 'bg-primary'}
              variant="icon"
              size="icon"
              onClick={handleMode}>
              <SVGIcon icon="add-edge" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Draw New Span</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover open={isCreateEdgeActive || Boolean(selectedEdgeId)}>
        <PopoverTrigger />
        <PopoverContent
          className="max-w-[125px] border-none !bg-transparent p-0 shadow-none"
          align="start"
          side="bottom"
          sideOffset={20} // px offset from side
          alignOffset={0}>
          <div className="flex flex-col gap-4">
            {Boolean(selectedEdgeId && selectedEdgeId !== -1) && (
              <div className="flex max-w-[110px] flex-col gap-3">
                <RemoveEdgeConfirmation
                  triggerComponent={
                    <Button variant="destructive" className="flex" disabled={isLoading}>
                      <SVGIcon icon="delete-edge" /> Delete Span
                    </Button>
                  }
                  handleAction={handleAction}
                />
                <Button variant="muted" className="bg-white" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            )}
            {Boolean(newEdges?.length || isCreateEdgeActive) && (
              <div className="flex max-w-[110px] flex-col gap-3">
                <Button
                  className="flex bg-secondary disabled:!bg-secondary"
                  onClick={handleSaveCreateEdge}
                  disabled={!newEdges?.length}
                  loading={isLoading}>
                  Done Drawing
                </Button>
                <Button
                  variant="muted"
                  className="bg-white !text-xs"
                  onClick={handleUndo}
                  disabled={!drawingSpanPoles?.length || isLoading}>
                  Undo
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default CreateEdge;
