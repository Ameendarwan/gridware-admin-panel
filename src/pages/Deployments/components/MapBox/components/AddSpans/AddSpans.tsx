import { Card, CardContent } from '@app/components/Card/Card';
import { Dispatch, FC, SetStateAction, useMemo } from 'react';
import { LineType, SpanT } from '@app/pages/Deployments/components/MapBox/types';

import { Button } from '@app/components/Button/Button';
import Span from '@app/pages/Deployments/components/MapBox/components/Span';

interface AddSpansProps {
  spans: SpanT[];
  setSpans: Dispatch<SetStateAction<SpanT[]>>;
  hideSpanRemove?: boolean;
  hideAddSpan?: boolean;
  selectSpanDisabled?: boolean;
}

const AddSpans: FC<AddSpansProps> = ({ spans, setSpans, hideSpanRemove, hideAddSpan, selectSpanDisabled }) => {
  const MAX_PRIMARY = 3;
  const MAX_TRANSMISSION = 3;
  const MAX_SECONDARY = 1;
  const MAX_SPANS = 7;

  const countSpansByType = (type: LineType) => spans.filter(span => span.type === type).length;

  const isAddSpanDisabled = useMemo(() => spans.length >= MAX_SPANS, [spans]);

  const primaryCount = countSpansByType(LineType.Primary);
  const transmissionCount = countSpansByType(LineType.Transmission);
  const secondaryCount = countSpansByType(LineType.Secondary);

  const handleAddSpan = () => {
    if (isAddSpanDisabled) return;

    if (primaryCount < MAX_PRIMARY) {
      setSpans(prevSpans => [...prevSpans, { id: Date.now(), isNew: true, type: LineType.Primary, phase: 1, line: 1 }]);
    } else if (transmissionCount < MAX_TRANSMISSION) {
      setSpans(prevSpans => [
        ...prevSpans,
        { id: Date.now(), isNew: true, type: LineType.Transmission, phase: 1, line: 1 },
      ]);
    } else if (secondaryCount < MAX_SECONDARY) {
      setSpans(prevSpans => [...prevSpans, { id: Date.now(), isNew: true, type: LineType.Secondary, value: true }]);
    }
  };

  const handleUpdateSpan = (id?: number, updatedData?: Partial<SpanT>, isNew?: boolean) => {
    let newSpan = updatedData;
    setSpans(prevSpans =>
      prevSpans.map(span => {
        if ((isNew && span.id === id) || (!isNew && span.association_id === id)) {
          const updatedSpan = { ...span, ...newSpan };
          if (updatedSpan.phase && updatedSpan.line && updatedSpan.phase > updatedSpan.line) {
            updatedSpan.phase = updatedSpan.line;
          }
          if (newSpan?.type === LineType.Secondary) {
            updatedSpan.line = undefined;
            updatedSpan.phase = undefined;
            updatedSpan.value = true;
          }
          return updatedSpan;
        }
        return span;
      })
    );
  };

  const handleRemoveSpan = (id: number) => {
    setSpans(prevSpans => prevSpans.filter(span => span.id !== id));
  };

  return (
    <Card className="bg-grayShades-shade1 p-3">
      <CardContent className="space-y-2.5 p-0">
        {spans?.map(span => (
          <Span
            span={span}
            key={`${span.association_id}-${span.id}`}
            onUpdate={updatedData =>
              handleUpdateSpan(span.isNew ? span.id : span.association_id, updatedData, Boolean(span.isNew))
            }
            onRemove={handleRemoveSpan}
            spanTypesCount={{
              primary: primaryCount < MAX_PRIMARY,
              transmission: transmissionCount < MAX_TRANSMISSION,
              secondary: secondaryCount < MAX_SECONDARY,
            }}
            hideSpanRemove={hideSpanRemove}
            selectSpanDisabled={selectSpanDisabled}
          />
        ))}
        {!hideAddSpan && (
          <Button
            className="w-full bg-secondary"
            onClick={handleAddSpan}
            data-testid="add-span-btn"
            disabled={isAddSpanDisabled}>
            ADD SPAN
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AddSpans;
