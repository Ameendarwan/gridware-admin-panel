import { Popover, PopoverContent, PopoverTrigger } from '@app/components/Popover/Popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';
import { useCallback, useState } from 'react';

import { Button } from '@app/components/Button/Button';
import { mapStyles } from '@app/pages/Deployments/components/MapBox/MapBox.utils';
import SVGIcon from '@app/components/SVGIcon';

const MapStyleSwitcher = ({
  mapStyle,
  setMapStyle,
}: {
  mapStyle: string;
  setMapStyle: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [open, setOpen] = useState(false);

  const handleStyleChange = useCallback(
    (styleId: string) => {
      setMapStyle(`mapbox://styles/mapbox/${styleId}`);
    },
    [setMapStyle]
  );

  return (
    <section onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} aria-label="Map style switcher">
      <TooltipProvider>
        <Popover open={open}>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="icon" size="icon" className={open ? '!bg-secondary' : 'bg-primary'}>
                    <SVGIcon icon="map-layers" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change Map Style</p>
              </TooltipContent>
            </Tooltip>

            {/* Map Style Options (Appears on Hover) */}
            <PopoverContent
              side="left"
              align="start"
              className="flex w-36 flex-col gap-2 rounded-lg bg-white p-2 shadow-md">
              {mapStyles.map(style => (
                <Button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`w-full text-left ${mapStyle.includes(style.id) ? 'bg-gray-300' : ''}`}
                  variant="outline">
                  {style.name}
                </Button>
              ))}
            </PopoverContent>
          </div>
        </Popover>
      </TooltipProvider>
    </section>
  );
};

export default MapStyleSwitcher;
