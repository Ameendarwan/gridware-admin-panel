import { FC } from 'react';
import { Label } from '@app/components/Label/Label';
import { Separator } from '@app/components/Separator/Separator';
import { getPoleLabel } from '../ViewPole.utils';

interface PoleBasicInfoProps {
  pole: any;
}

const PoleBasicInfo: FC<PoleBasicInfoProps> = ({ pole }) => {
  return (
    <>
      <div className="flex w-full flex-col items-start gap-2.5 font-bold">
        <div className="flex flex-1 shrink basis-0 flex-col">
          <Label className="!text-xss font-bold text-grayShades-shade7">Pole ID</Label>
          <Label className="mt-1.5 text-xs font-bold text-primary">{pole?.pole_id}</Label>
        </div>
        <div className="flex flex-1 shrink basis-0 flex-col">
          <Label className="!text-xss font-bold text-grayShades-shade7">Pole Label</Label>
          <Label className="mt-1.5 text-xs font-bold text-primary">{getPoleLabel(pole)}</Label>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <Label className="!text-xss font-bold text-grayShades-shade7">Pole Status </Label>
          {pole?.status && (
            <span className="text-xs font-bold capitalize text-primary">
              {pole?.status === 'pending' ? '' : pole?.status}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <Label className="!text-xss font-bold text-grayShades-shade7">Inaccessible Reason</Label>
          <span className="text-xs font-bold capitalize text-primary">{pole?.status_type || 'N/A'}</span>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <Label className="!text-xss font-bold text-grayShades-shade7">Access Efforts</Label>
          <div className="flex flex-col">
            {pole?.access_efforts?.length ? (
              pole?.access_efforts?.map((effort: string) => (
                <span key={effort} className="break-all text-xs font-bold capitalize text-primary">
                  {effort}
                </span>
              ))
            ) : (
              <span className="break-all text-xs font-bold capitalize text-primary">N/A</span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <Label className="!text-xss font-bold text-grayShades-shade7">Inaccessible Comment</Label>
          <span className="break-all text-xs font-bold capitalize text-primary">{pole?.status_reason || 'N/A'}</span>
        </div>
      </div>

      <Separator className="my-4" />
    </>
  );
};

export default PoleBasicInfo;
