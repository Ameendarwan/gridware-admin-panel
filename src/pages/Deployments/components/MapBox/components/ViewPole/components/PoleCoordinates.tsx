import { FC } from 'react';
import { Label } from '@app/components/Label/Label';
import { Separator } from '@app/components/Separator/Separator';
import CopyCoordinatesButton from '../../CopyCoordinatesButton';

interface PoleCoordinatesProps {
  lat?: number;
  long?: number;
}

const PoleCoordinates: FC<PoleCoordinatesProps> = ({ lat, long }) => {
  return (
    <>
      <div className="flex w-full items-center gap-2.5">
        <div className="flex flex-1 gap-2.5">
          <div className="flex flex-1 flex-col">
            <Label className="!text-xss font-bold text-grayShades-shade7">Lat</Label>
            <span className="text-xs font-bold text-primary">{lat}</span>
          </div>
          <div className="flex flex-1 flex-col">
            <Label className="!text-xss font-bold text-grayShades-shade7">Long</Label>
            <span className="text-xs font-bold text-primary">{long}</span>
          </div>
        </div>
        <CopyCoordinatesButton lat={lat} long={long} />
      </div>

      <Separator className="my-4" />
    </>
  );
};

export default PoleCoordinates;
