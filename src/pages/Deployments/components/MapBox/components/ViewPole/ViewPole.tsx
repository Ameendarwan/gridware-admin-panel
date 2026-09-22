import { FC, useRef } from 'react';
import { useSelector } from 'react-redux';

import { MapMode } from '../../types';
import PoleImageSection from '../PoleImageSection';
import { RootState } from '@app/store';
import { ViewPoleProps } from './types';
import { getPoleMarkerName } from '@app/pages/Deployments/components/MapBox/MapBox.utils';
import PoleBasicInfo from './components/PoleBasicInfo';
import PoleCoordinates from './components/PoleCoordinates';
import PoleDevices from './components/PoleDevices';
import PoleMetadata from './components/PoleMetadata';

const PoleView: FC<ViewPoleProps> = ({ pole, handleEditPole }) => {
  const mode = useSelector((state: RootState) => state.edges.mode);
  const ref = useRef(null);
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const selectedPoleDetails = poles?.find(poleObj => poleObj.id === pole?.id);
  const poleIconName = selectedPoleDetails ? getPoleMarkerName(selectedPoleDetails) : 'marker-gs';

  if (mode === MapMode.POLEVIEW)
    return (
      <div ref={ref} className="flex flex-col justify-center rounded font-mont shadow-[0px_4px_16px_rgba(0,0,0,0.15)]">
        <PoleImageSection
          pole={pole ?? null}
          disableUpload={true}
          handleEditPole={handleEditPole}
          poleIconName={poleIconName}
        />
        <div className="flex w-full flex-1 flex-col overflow-y-auto rounded-none bg-white">
          <div className="overflow-auto px-4">
            <PoleBasicInfo pole={pole} />
            <PoleCoordinates lat={pole?.lat} long={pole?.long} />
            <PoleDevices devices={pole?.devices} />
            <PoleMetadata pole={pole} />
          </div>
        </div>
      </div>
    );
  return <></>;
};

export default PoleView;
