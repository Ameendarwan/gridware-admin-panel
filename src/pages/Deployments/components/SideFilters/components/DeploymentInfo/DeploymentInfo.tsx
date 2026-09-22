import { Deployment } from '@app/pages/Deployments/types';
import { Label } from '@app/components/Label/Label';
import Loader from '@app/components/Loader/Loader';
import React from 'react';
import SVGIcon from '@app/components/SVGIcon';

interface DeploymentInfoProps {
  isCollapsed?: boolean;
  deploymentData?: Deployment;
  isLoading?: boolean;
}

const DeploymentInfo = ({ isCollapsed, deploymentData, isLoading }: DeploymentInfoProps) => {
  if (!isCollapsed)
    return (
      <>
        <div className="flex w-full items-center justify-between gap-2.5 whitespace-nowrap bg-white px-4 pb-[20px] pt-[20px]">
          <div className="flex flex-row gap-3">
            <SVGIcon icon="tree" />
            {!isCollapsed && (
              <h1
                className="my-auto self-stretch text-base font-bold leading-none text-stone-900"
                data-testid="side-filter-deployment-name">
                {deploymentData?.name}
              </h1>
            )}
          </div>
        </div>
        <section
          className={`transition-[max-height, padding] flex max-h-[500px] w-full flex-col justify-center overflow-hidden border-b-[1px] bg-white px-4 pb-3 text-xs font-bold leading-none text-stone-900 duration-300`}>
          {isLoading ? (
            <Loader width={'50'} height={'50'} />
          ) : (
            <>
              <div className="flex w-full flex-col whitespace-nowrap">
                <div className="flex w-full items-start">
                  <Label className="flex-1 text-xs">ID</Label>
                  <Label className="flex-1 text-xs">Location</Label>
                </div>
                <div className="mt-1.5 flex w-full items-start">
                  <span className="flex-1">{deploymentData?.id}</span>
                  <span className="flex-1">{deploymentData?.location}</span>
                </div>
              </div>
              <div className="mt-4 flex w-full flex-col">
                <div className="flex w-full items-start">
                  <Label className="flex-1">Pole Count</Label>
                </div>
                <div className="mt-1.5 flex w-full items-start whitespace-nowrap">
                  <span className="flex-1 shrink basis-0">{deploymentData?.poles_count}</span>
                </div>
              </div>
            </>
          )}
        </section>
      </>
    );
  return <></>;
};

export default DeploymentInfo;
