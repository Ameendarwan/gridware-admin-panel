import * as turf from '@turf/turf';

import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import { setIsMeasuringDistance, setMeasureDistancePoints } from '@app/store/slices/polesSlice';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@app/components/Button/Button';
import { RootState } from '@app/store';
import { Separator } from '@app/components/Separator/Separator';
import SVGIcon from '@app/components/SVGIcon';

const MeasureDistance = () => {
  const dispatch = useDispatch();
  const distancePoints = useSelector((state: RootState) => state.poles.measureDistancePoints);

  const [open, setOpen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const handleMeasuring = (measure: boolean) => {
    setIsMeasuring(measure);
    dispatch(setIsMeasuringDistance(measure));
    if (!measure) dispatch(setMeasureDistancePoints(null));
  };

  const calculateDistance = useCallback(() => {
    if (distancePoints?.length === 2) {
      const from = turf.point([distancePoints[0][0], distancePoints[0][1]]);
      const to = turf.point([distancePoints[1][0], distancePoints[1][1]]);
      const distanceInKM = turf.distance(from, to, { units: 'kilometers' }).toFixed(2);
      const distanceInMiles = turf.distance(from, to, { units: 'miles' }).toFixed(2);
      return `${distanceInKM} Kilometers (${distanceInMiles} Miles)`;
    }
    return null;
  }, [distancePoints]);

  const handleCancel = () => {
    setOpen(false);
    setIsMeasuring(false);
    dispatch(setIsMeasuringDistance(false));
    dispatch(setMeasureDistancePoints(null));
  };

  return (
    <section
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      aria-label="Distance measurement tool">
      <Popover open={open || isMeasuring}>
        <div>
          <PopoverTrigger asChild>
            <Button variant="icon" size="icon" className={open || isMeasuring ? '!bg-secondary' : 'bg-primary'}>
              <SVGIcon icon="measure-distance" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          className={`${distancePoints?.length === 2 ? 'w-full' : 'max-w-max'} p-2`}
          side="left"
          align="start">
          {isMeasuring ? (
            <div className="flex flex-col gap-2">
              <span className="text-md text-primary">Measure distances</span>
              <Separator orientation="horizontal" />

              <span className="text-sm text-primary">
                {(() => {
                  if (distancePoints?.length === 2) {
                    return (
                      <span>
                        Path Distance: <span className="font-semibold">{calculateDistance()}</span>
                      </span>
                    );
                  }
                  if (distancePoints?.length === 1) {
                    return 'Select another point';
                  }
                  return 'Start creating a measurement by adding points to the map';
                })()}
              </span>
              <Separator orientation="horizontal" />
              <div className="flex flex-row gap-1">
                <Button className="flex max-w-max" onClick={handleCancel}>
                  <i className="fa-solid fa-xmark" /> Cancel
                </Button>
                <Button className="flex max-w-max" onClick={() => handleMeasuring(false)}>
                  <i className="fa-solid fa-check" /> Finish measurement
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span>Measure distances and areas</span>
              <Separator orientation="horizontal" />
              <Button className="flex max-w-max" onClick={() => handleMeasuring(true)}>
                <i className="fa-solid fa-plus" /> Create a new measurement
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </section>
  );
};

export default MeasureDistance;
