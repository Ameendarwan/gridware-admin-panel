import { Card, CardContent } from '@app/components/Card/Card';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import { MapMode, SpanT } from '../../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';
import { getLineColor, getLineTypeByKey } from '@app/pages/Deployments/components/MapBox/MapBox.utils';
import { useDispatch, useSelector } from 'react-redux';

import Bullet from '@app/components/Bullet';
import { Button } from '@app/components/Button/Button';
import ConfirmationDialog from '@app/components/ConfirmationDialog';
import Loader from '@app/components/Loader/Loader';
import { MoreHorizontal } from 'lucide-react';
import { RootState } from '@app/store';
import Span from '../Span';
import { isEqual } from 'lodash';
import { setMode } from '@app/store/slices/edgesSlice';
import { useParams } from 'react-router-dom';
import { useToast } from '@app/hooks/useToast';
import { useUpdateSpansMutation } from '@app/store/apis/edge/edge';

const Legends: FC = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { id: deploymentId } = useParams<{ id: string }>();

  const spansList = useSelector((state: RootState) => state.edges.spansList);
  const edgesList = useSelector((state: RootState) => state.edges.edgesList);

  const [selectedSpan, setSelectedSpan] = useState<Partial<SpanT> | null>(null);
  const [updatedSpan, setUpdatedSpan] = useState<Partial<SpanT> | null>(null);
  const [isHiddenSpan, setIsHiddenSpan] = useState(false);

  const [updateSpans, { data: updateSpanResponse, isError, isSuccess, isLoading }] = useUpdateSpansMutation();

  const associatedSpans = useMemo(() => {
    return edgesList?.flatMap(edge => edge.spans) ?? ([] as SpanT);
  }, [edgesList]);

  useEffect(() => {
    /**
     * Effect hook to show toast notifications based on success or error states.
     * - If the operation is successful, a success toast is displayed.
     * - If an error occurs, an error toast is shown.
     */
    if (isSuccess) {
      toast({
        variant: 'success',
        title: 'Span has been updated successfully',
      });
    }

    if (isError)
      toast({
        variant: 'destructive',
        title: updateSpanResponse?.message ?? 'Failed to update span',
      });
  }, [isSuccess, isError, toast, updateSpanResponse?.message]);

  const handleUpdateSpan = (updatedSpan?: Partial<SpanT>) => {
    setUpdatedSpan(prev => {
      const updated = { ...prev, ...updatedSpan };
      if (updated.phase && updated.line && updated.phase > updated.line) {
        updated.phase = updated.line;
      }
      return updated;
    });
  };

  const renderBulletWithConfirmation = (span: string, index: number, isHidden?: boolean) => {
    const [type, name] = span.split('-');
    const [phase, line] = name?.split('.') ?? [-1, -1];
    const lineType = getLineTypeByKey(type) ?? '';

    const handleClick = () => {
      if (isHidden) setIsHiddenSpan(true);
      setUpdatedSpan({
        id: Date.now(),
        type: lineType,
        phase: Number(phase),
        line: Number(line),
      });
      setSelectedSpan({
        id: Date.now(),
        type: lineType,
        phase: Number(phase),
        line: Number(line),
      });
    };

    const handleClose = () => {
      setSelectedSpan(null);
      setIsHiddenSpan(false);
    };

    const handleUpdate = async () => {
      const selectedSpansList = associatedSpans?.filter(
        span =>
          span?.type === selectedSpan?.type && span?.line === selectedSpan?.line && span?.phase === selectedSpan?.phase
      );

      const result = selectedSpansList?.map(span => ({
        id: span?.association_id,
        type: span?.type,
        line: updatedSpan?.line,
        phase: updatedSpan?.phase,
      }));

      if (result.length) {
        const updateEdgeSpansPayload = {
          spans: result,
          edge_id: null,
        };

        if (deploymentId) await updateSpans({ deploymentId, body: updateEdgeSpansPayload });
        dispatch(setMode(MapMode.NOVIEW));
      }
    };

    return (
      <div className="flex cursor-pointer flex-row items-center gap-2 p-2" key={span}>
        <ConfirmationDialog
          title="Update Span Configuration"
          description=""
          triggerComponent={
            <div className="flex flex-row gap-2">
              <Bullet
                onClick={handleClick}
                className={`!rounded-none ${type === 'T' && 'border border-dashed border-white'}`}
                color={getLineColor(Number(phase), Number(line))}
              />
              <div className="text-xs font-bold leading-relaxed">{span}</div>
            </div>
          }
          handleClose={handleClose}
          confirmationComponent={
            <Button
              loading={isLoading}
              type="button"
              disabled={type === 'S' || isEqual(selectedSpan, updatedSpan)}
              onClick={handleUpdate}>
              UPDATE
            </Button>
          }>
          <Card className="w-full bg-grayShades-shade1 p-3">
            <CardContent className="max-w-[300px] space-y-2.5 p-0">
              {lineType && <Span span={updatedSpan ?? null} onUpdate={handleUpdateSpan} hideSpanRemove={true} />}
            </CardContent>
          </Card>
        </ConfirmationDialog>
      </div>
    );
  };

  if (!spansList || edgesList?.length === 0) return null;

  const visibleSpans = spansList.slice(0, 5);
  const hiddenSpans = spansList.slice(5);

  return (
    <TooltipProvider>
      <div
        className="flex items-start gap-3 overflow-hidden rounded bg-white px-1 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
        data-testid="spans-legend">
        {spansList.length === 0 ? (
          <Loader width={'150'} height={'40'} />
        ) : (
          <>
            {visibleSpans?.map((span, index) => renderBulletWithConfirmation(span, index))}
            {hiddenSpans?.length > 0 && (
              <Tooltip open={isHiddenSpan || undefined}>
                <TooltipTrigger asChild>
                  <div className="flex cursor-pointer flex-row items-center gap-2 p-2">
                    <Bullet className="bg-gray-300" />
                    <div className="flex items-center gap-1 text-xs font-bold leading-relaxed">
                      +{hiddenSpans?.length} more
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="z-50 rounded bg-white p-2 shadow-lg">
                  <div className="flex flex-col gap-1">
                    {hiddenSpans?.map((span, index) => renderBulletWithConfirmation(span, index, true))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default memo(Legends);
