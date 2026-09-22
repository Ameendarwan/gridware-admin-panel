import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';

import Bullet from '@app/components/Bullet';
import DeploymentInfo from '@app/pages/Deployments/components/SideFilters/components/DeploymentInfo';
import { MapMode } from '../MapBox/types';
import { RootState } from '@app/store';
import ValidationContent from './components/ValidationContent';
import { errorToastDuration } from '@app/pages/Deployments/components/MapBox/MapBox.utils';
import { setIsSidebarFiltersCollapsed } from '@app/store/slices/sidebarsSlice';
import { toast } from 'sonner';
import { useGetDeploymentByIdQuery } from '@app/store/apis/deployments/deployments';

const SideFilters: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { id: deploymentId } = useParams<{ id: string }>();
  const {
    data: deployment,
    isError: isErrorDeployment,
    isLoading: isLoadingDeployment,
  } = useGetDeploymentByIdQuery({ deploymentId: deploymentId ?? '' }, { skip: !deploymentId });
  const selectedPoleIdForValidation = useSelector((state: RootState) => state.poles.selectedPoleIdForValidation);

  useEffect(() => {
    if (selectedPoleIdForValidation !== -1) {
      searchParams.set('mode', MapMode.POLEVIEW);
      searchParams.set('pole_id', `${selectedPoleIdForValidation}`);
      setSearchParams(searchParams);
    }
  }, [selectedPoleIdForValidation]);

  const handleCollapse = () => {
    const updatedCollapsedStatus = !isCollapsed;
    setIsCollapsed(updatedCollapsedStatus);
    dispatch(setIsSidebarFiltersCollapsed(updatedCollapsedStatus));
  };

  useEffect(() => {
    if (isErrorDeployment) {
      toast.error('Error Fetching deployment details', { duration: errorToastDuration });
    }
  }, [isErrorDeployment]);

  return (
    <div className="relative flex h-full">
      <div
        className={`scrollbar-hide h-auto overflow-scroll transition-all duration-300 ${isCollapsed ? 'w-4' : 'w-[325px]'}`}>
        <DeploymentInfo isCollapsed={isCollapsed} isLoading={isLoadingDeployment} deploymentData={deployment?.data} />
        <ValidationContent
          deploymentId={deploymentId}
          isCollapsed={isCollapsed}
          deploymentName={deployment?.data?.name ?? ''}
        />
      </div>
      <Bullet
        className="absolute -right-4 top-11 z-50 !h-6 !w-6 bg-primary p-0.5"
        data-testid="side-filter-collapse-btn"
        onClick={handleCollapse}>
        {isCollapsed ? <ChevronRight className="h-4 w-4 text-white" /> : <ChevronLeft className="h-4 w-4 text-white" />}
      </Bullet>
    </div>
  );
};

export default SideFilters;
