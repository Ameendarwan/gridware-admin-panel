import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFromPole } from '@app/store/slices/edgesSlice';
import { Pole } from '@app/store/apis/pole/types';
import { RootState } from '@app/store';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';

const useMapCenter = (poles?: { data?: Pole[] }) => {
  const [latitude, setLatitude] = useState(33);
  const [longitude, setLongitude] = useState(70);
  const [zoom, setZoom] = useState(4);
  const [searchParams] = useSearchParams();
  const poleId = searchParams.get('pole_id');
  const mode = useSelector((state: RootState) => state.edges.mode);
  const poleSidebarCloseClicked = useSelector((state: RootState) => state.poles.poleSidebarCloseClicked);
  const dispatch = useDispatch();
  const mapRef = useSelector((state: RootState) => state.poles.mapRef);

  useEffect(() => {
    if (poles?.data?.length) {
      // If there's a selected pole, zoom to it
      if (poleId) {
        const selectedPole = poles.data.find(pole => pole.id === Number(poleId));
        if (selectedPole) {
          dispatch(setSelectedFromPole(selectedPole.id));
          setLatitude(selectedPole.lat);
          setLongitude(selectedPole.long);
          // Dynamically calculate zoom level based on clustering or granularity requirements
          const baseZoom = 18;
          const adjustmentFactor = 0.5;
          const zoomAdjustment = Math.abs(selectedPole.lat) > 60 ? adjustmentFactor : 0;
          const calculatedZoom = baseZoom - zoomAdjustment;
          setZoom(calculatedZoom);
          setTimeout(() => {
            mapRef?.easeTo({ zoom: calculatedZoom });
          }, 50);
          return;
        }
      }

      if (!poleSidebarCloseClicked && ![MapMode.EDGEVIEW, MapMode.POLEADD].includes(mode)) {
        // Otherwise, fit view to show all poles
        const latitudes = poles.data.map(pole => pole.lat);
        const longitudes = poles.data.map(pole => pole.long);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        // Add padding to bounds (10% of the range)
        const latPadding = (maxLat - minLat) * 0.1;
        const lngPadding = (maxLng - minLng) * 0.1;

        // Calculate center point
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Calculate appropriate zoom level
        const latZoom = Math.log2(360 / (maxLat - minLat + 2 * latPadding)) + 1;
        const lngZoom = Math.log2(360 / (maxLng - minLng + 2 * lngPadding)) + 1;
        const calculatedZoom = Math.min(latZoom, lngZoom, 15);

        setLatitude(centerLat);
        setLongitude(centerLng);
        setZoom(calculatedZoom);
      }
    }
  }, [poles, poleId]);

  return { latitude, setLatitude, longitude, setLongitude, zoom, setZoom };
};

export default useMapCenter;
