import React, { FC, ReactNode } from 'react';

import Loader from '@app/components/Loader/Loader';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { Pole } from '@app/store/apis/pole/types';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';

export interface ViewEditSectionProps {
  pole: Pole | null;
  mode: MapMode;
  layer?: any;
  children?: ReactNode;
}
const ViewEditSection: FC<ViewEditSectionProps> = ({ pole, mode, layer, children }) => {
  const isLoading = useSelector((state: RootState) => state.poles.isPoleLoading);
  if (pole || layer || mode === MapMode.CREATEEDGE || mode === MapMode.POLEADD)
    return (
      <div className="absolute bottom-0 left-5 top-0 z-50 my-4 h-fit rounded bg-white !font-mont shadow-custom">
        <div className={`flex max-h-[78vh] w-[300px] flex-col overflow-auto ${isLoading && 'blur-[1px]'}`}>
          {children}
        </div>
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Loader />
          </div>
        )}
      </div>
    );

  return <></>;
};

export default ViewEditSection;
