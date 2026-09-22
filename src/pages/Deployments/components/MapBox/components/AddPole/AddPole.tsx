import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';

import { Button } from '@app/components/Button/Button';

import SVGIcon from '@app/components/SVGIcon';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsAddingPole,
  setIsMeasuringDistance,
  setMeasureDistancePoints,
  setSelectedPole,
} from '@app/store/slices/polesSlice';
import { RootState } from '@app/store';

const AddPole = () => {
  const dispatch = useDispatch();

  const mapRef = useSelector((state: RootState) => state.poles.mapRef);
  const isAddingPole = useSelector((state: RootState) => state.poles.isAddingPole);

  const handleAddPoleClick = () => {
    dispatch(setIsMeasuringDistance(false));
    dispatch(setMeasureDistancePoints(null));
    dispatch(setIsAddingPole(true));
    dispatch(setSelectedPole(null));
    if (mapRef) {
      mapRef.getCanvas().style.cursor = 'crosshair';
    }
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-testid="add-pole-button"
            variant="icon"
            size="icon"
            className={isAddingPole ? '!bg-secondary' : 'bg-primary'}
            onClick={handleAddPoleClick}>
            <SVGIcon icon="add-pole" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Pole</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddPole;
