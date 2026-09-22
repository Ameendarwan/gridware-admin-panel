import { setIsSelectingFromPole, setIsSelectingToPole } from '@app/store/slices/edgesSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@app/components/Button/Button';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { RootState } from '@app/store';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';

const PolesSelector = () => {
  const isSelectingFromPole = useSelector((state: RootState) => state.edges.isSelectingFromPole);
  const isSelectingToPole = useSelector((state: RootState) => state.edges.isSelectingToPole);
  const selectedFromPole = useSelector((state: RootState) => state.edges.selectedFromPole);
  const selectedToPole = useSelector((state: RootState) => state.edges.selectedToPole);
  const poles = useSelector((state: RootState) => state?.poles?.polesList ?? []);
  const selectedFromPoleDetails = poles.find(pole => pole.id === selectedFromPole);
  const selectedToPoleDetails = poles.find(pole => pole.id === selectedToPole);
  const mode = useSelector((state: RootState) => state.edges.mode);
  const dispatch = useDispatch();
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="space-y-1">
        <span className="text-xss font-bold text-secondary">From</span>
        <Button
          data-testid="select-from-pole"
          className="h-6 w-full bg-[#E4EBFD] font-bold text-accent hover:bg-white hover:text-primary"
          disabled={isSelectingFromPole}
          onClick={() => {
            dispatch(setIsSelectingFromPole(true));
          }}>
          Select Pole
        </Button>
        {mode === MapMode.EDGEEDIT ? null : (
          <TruncatedTextCell
            value={selectedFromPole === -1 ? 'From:' : `From: ${selectedFromPoleDetails?.pole_id}`}
            trimSize={15}
            position="bottom"
            className="text-xs font-bold text-black"
          />
        )}
      </div>
      <div className="space-y-1">
        <span className="text-xss font-bold text-secondary">To</span>
        <Button
          data-testid="select-to-pole"
          className="h-6 w-full bg-[#E4EBFD] font-bold text-accent hover:bg-white hover:text-primary"
          disabled={isSelectingToPole}
          onClick={() => {
            dispatch(setIsSelectingToPole(true));
          }}>
          Select Pole
        </Button>
        {mode === MapMode.EDGEEDIT ? null : (
          <TruncatedTextCell
            value={selectedToPole === -1 ? 'To:' : `To: ${selectedToPoleDetails?.pole_id}`}
            trimSize={15}
            position="bottom"
            className="text-xs font-bold text-black"
          />
        )}
      </div>
    </div>
  );
};

export default PolesSelector;
