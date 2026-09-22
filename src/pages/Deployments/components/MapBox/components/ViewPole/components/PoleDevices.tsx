import { FC } from 'react';
import { Device, OrientationOptions } from '@app/store/apis/devices/types';
import { Label } from '@app/components/Label/Label';
import { Separator } from '@app/components/Separator/Separator';
import { Badge } from '@app/components/Badge/Badge';
import SVGIcon from '@app/components/SVGIcon';

interface PoleDevicesProps {
  devices?: Device[];
}

const PoleDevices: FC<PoleDevicesProps> = ({ devices }) => {
  return (
    <>
      <section className="flex w-full flex-col gap-1">
        <Label className="!text-xss font-bold text-grayShades-shade7">Devices</Label>

        {!devices?.length && <span className="text-xs font-bold text-primary">N/A</span>}

        {devices?.map((device: Device, index: number) => (
          <div key={device.id} className="mt-1.5 flex flex-col">
            <div className="flex flex-row justify-end">
              <span className="rounded bg-secondary px-1.5 text-[8px] uppercase text-white">{device?.type}</span>
            </div>
            <div className="mt-2.5 flex w-full items-center justify-between gap-2">
              <div className="flex flex-col justify-center self-start whitespace-nowrap rounded bg-white py-1 text-xs font-bold text-black">
                <div className="flex flex-row gap-3">
                  <div className="w-full min-w-[75px] gap-1.5 self-stretch">{device?.serial_no}</div>
                  <div className="flex h-full items-center gap-1">
                    <div className="my-auto flex items-center justify-center gap-1.5 self-stretch rounded px-0.5">
                      <SVGIcon icon="compass" />
                    </div>
                    <div className="my-auto self-stretch text-xs font-bold uppercase text-zinc-800">
                      {Object.entries(OrientationOptions).find(([_, value]) => value === device.solar_orientation)?.[0]}
                    </div>
                  </div>
                </div>
              </div>

              {device.is_blinked ? (
                <Badge variant="success" className="h-6 flex-1 justify-center whitespace-nowrap rounded-md">
                  CONNECTED
                </Badge>
              ) : (
                <Badge variant="outline" className="h-6 flex-1 justify-center whitespace-nowrap rounded-md">
                  DID NOT CONNECT
                </Badge>
              )}
            </div>
            {index !== (devices?.length ?? 0) - 1 && <Separator className="mt-2.5" />}
          </div>
        ))}
      </section>

      <Separator className="my-3" />
    </>
  );
};

export default PoleDevices;
