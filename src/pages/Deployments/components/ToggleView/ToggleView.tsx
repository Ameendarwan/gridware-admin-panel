import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Input } from '@app/components/Input/Input';
import { RootState } from '@app/store';
import SVGIcon from '@app/components/SVGIcon';
import { toast } from 'sonner';
import { urls } from '@app/routes/urls';
import { setSearchTerm } from '@app/store/slices/polesSlice';

interface ToggleViewProps {
  isMapView: boolean;
  handleView: (url: string) => void;
}

const ToggleView: FC<ToggleViewProps> = ({ isMapView, handleView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const polesList = useSelector((state: RootState) => state.poles.polesList);
  const searchTerm = useSelector((state: RootState) => state.poles.searchTerm);
  const { id: deploymentId } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const performSearch = useCallback(() => {
    if (!searchTerm?.trim()) return;

    const matchingPoles = polesList.filter(
      pole => pole?.pole_id === searchTerm?.trim() || pole?.id?.toString() === searchTerm?.trim()
    );

    const matchingDevicePoles = polesList.filter(
      pole => pole?.devices?.some(device => device?.serial_no?.includes(searchTerm) && !device?.disabled) ?? false
    );

    const allMatches = [
      ...matchingPoles,
      ...(matchingDevicePoles ?? []).filter(pole => !(matchingPoles ?? []).some(p => p.id === pole.id)),
    ];

    if (allMatches.length === 1) {
      const foundPole = allMatches[0];
      const newUrl = `${location.pathname}?mode=POLEVIEW&pole_id=${foundPole.id}`;
      navigate(newUrl);
    } else if (allMatches.length > 1) {
      const pole_ids = allMatches.map(pole => pole.id);
      dispatch(setSearchTerm(''));
      handleView(`/poles?id=${pole_ids.join(',')}~contains&logical_operator=or`);
    } else {
      toast.error('No results found.');
    }
  }, [searchTerm, polesList, location.pathname, navigate, handleView, dispatch]);

  return (
    <div className="relative flex w-full flex-1 flex-row flex-wrap items-center gap-4 border-b-[1px] py-2 max-sm:justify-center sm:min-h-[57px] sm:py-0">
      <div className="flex flex-1 items-center gap-1">
        <div className="relative ml-6 flex h-8 items-center rounded-lg bg-grayShades-shade1 pl-3">
          <SVGIcon icon="search" />
          <Input
            className="h-8 w-[240px] border-none bg-grayShades-shade1 text-xs placeholder:text-[#3C3C3C] placeholder:text-opacity-30"
            placeholder="Search Pole Id/Serial number"
            value={searchTerm}
            onChange={e => {
              dispatch(setSearchTerm(e.target.value));
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                performSearch();
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
        <button
          type="button"
          className={`cursor-pointer rounded-[0.125rem] ${isMapView ? 'bg-[#E4EBFD]' : 'bg-transparent'} p-1`}
          onClick={() => handleView(urls.deployments.map)}>
          <SVGIcon icon="map-view" color={isMapView ? 'fill-accent' : 'fill-black'} width={16} height={16} />
        </button>
        <button
          type="button"
          className={`cursor-pointer rounded-[0.125rem] ${isMapView ? 'bg-transparent' : 'bg-[#E4EBFD]'} p-1`}
          onClick={() => handleView(`/poles?deployment_id=${deploymentId}~contains`)}>
          <SVGIcon icon="list-view" color={isMapView ? 'fill-black' : 'fill-accent'} width={16} height={16} />
        </button>
      </div>
    </div>
  );
};

export default ToggleView;
