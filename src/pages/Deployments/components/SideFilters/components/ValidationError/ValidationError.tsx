import { HIGHLIGHT_WORDS, exportSerialNumbers } from './ValidationError.utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';
import { setGpsLocationCoordinates, setSelectedPoleIdForValidation } from '@app/store/slices/polesSlice';
import { useDispatch, useSelector } from 'react-redux';

import Bullet from '@app/components/Bullet';
import { Button } from '@app/components/Button/Button';
import HighlightText from '../HighlightText';
import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';
import { Issue } from '../../types';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { RootState } from '@app/store';
import SVGIcon from '@app/components/SVGIcon';
import { useParams } from 'react-router-dom';
import { setSelectedFromPole } from '@app/store/slices/edgesSlice';

interface ValidationErrorProps {
  issue: Issue;
  icon: IconNames;
  color: string;
  handleIgnoreIssue?: (event: React.MouseEvent<HTMLButtonElement>, issueId: string) => void;
}

const ValidationError = ({ issue, icon, color, handleIgnoreIssue }: ValidationErrorProps) => {
  const { id: deploymentId } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const selectedPoleIdForValidation = useSelector((state: RootState) => state.poles.selectedPoleIdForValidation) ?? -1;

  const [isOpen, setIsOpen] = useState(false);
  const error_title = issue?.ids?.length > 0 ? issue?.ids : issue?.title;
  const isSelected = Array.isArray(error_title) ? error_title?.includes(selectedPoleIdForValidation) : false;

  const containerClickHandler = (pole_id: number) => {
    if (pole_id !== -1) {
      dispatch(setGpsLocationCoordinates(null));
      dispatch(setSelectedPoleIdForValidation(pole_id));
    }
  };

  const handleGPSLocation = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (issue?.coordinates && issue?.ids?.[0]) {
      dispatch(
        setGpsLocationCoordinates({
          lat: issue?.coordinates?.lat ?? 0,
          long: issue?.coordinates?.long ?? 0,

          aggregatedDeviceLatitude: issue?.coordinates?.aggregated_device_latitude ?? 0,
          aggregatedDeviceLongitude: issue?.coordinates?.aggregated_device_longitude ?? 0,
        })
      );
      dispatch(setSelectedFromPole(issue?.ids[0]));
    }
  };

  return (
    <TooltipProvider>
      <button
        type="button"
        onClick={() => containerClickHandler(issue?.ids?.length === 1 ? issue?.ids?.[0] : -1)}
        className={`flex w-full cursor-pointer flex-col justify-between text-left ${isSelected && 'bg-grayShades-shade4'} p-4`}>
        <div className="flex flex-row items-center justify-between">
          <div className="flex-rowitems-center flex gap-2">
            <Bullet className={`bg-validations-${color}/20`}>
              <SVGIcon icon={icon} height={10} width={10} color={`fill-validations-${color}`} />
            </Bullet>
            <div className={`flex flex-row flex-wrap gap-2 ${issue?.entity === 'device' && 'cursor-default'}`}>
              {Array.isArray(error_title) ? (
                error_title.map(pole_id => (
                  <button
                    type="button"
                    key={pole_id}
                    className={`text-xs font-bold text-grayShades-shade5 ${issue?.entity === 'device' ? 'pointer-events-none' : 'underline'} ${pole_id === selectedPoleIdForValidation && 'rounded-lg bg-yellow-50 p-1'}`}
                    onClick={() => containerClickHandler(pole_id)}>
                    {pole_id}
                  </button>
                ))
              ) : (
                <span className={`text-xs font-bold text-grayShades-shade5`}>{error_title}</span>
              )}
            </div>
          </div>

          {issue.hint && (
            <div className="flex cursor-pointer items-center">
              <Tooltip open={isOpen} onOpenChange={setIsOpen}>
                <TooltipTrigger>
                  <Bullet className="border-2 border-grayShades-shade6" onClick={() => setIsOpen(!isOpen)}>
                    <SVGIcon icon="tooltip" />
                  </Bullet>
                </TooltipTrigger>
                {ReactDOM.createPortal(
                  <TooltipContent
                    side="right"
                    className="z-[100] max-w-[250px] text-wrap bg-secondary px-2 py-3 !text-xs font-bold !leading-[26px] text-white">
                    <HighlightText
                      text={issue.hint}
                      highlightWords={HIGHLIGHT_WORDS}
                      highlightClassName="bg-white !text-sm text-black rounded-[3px] font-bold p-1"
                    />
                  </TooltipContent>,
                  document.body
                )}
              </Tooltip>
            </div>
          )}
        </div>
        <p className="px-1 py-3 text-xs font-bold text-destructive"> {issue.error}</p>
        <div className="flex flex-col gap-3">
          {issue?.is_warning && (
            <Button
              className={`flex max-w-max items-center ${issue.isIgnored ? 'bg-validations-upstream' : 'bg-blackShades-shade1'} ${issue.isIgnored ? 'hover:bg-validations-upstream' : 'hover:bg-blackShades-shade1'} font-semibold`}
              onClick={ev => handleIgnoreIssue?.(ev, issue.id)}>
              <SVGIcon icon="eye-closed" />
              {issue.isIgnored ? 'Ignored' : 'Ignore'}
            </Button>
          )}

          {issue.classifier === 'missing_gps_info' && (
            <Button
              variant="muted"
              className="!text-[12px] !font-bold"
              onClick={() => exportSerialNumbers([...(issue?.ids ?? [])], `${deploymentId}-serial_numbers`)}>
              Download Serial Numbers
            </Button>
          )}

          {issue.classifier === 'location_discrepancy' && (
            <Button variant="secondary" className="!text-[12px] !font-bold" onClick={handleGPSLocation}>
              Show GPS Location of Gridscope
            </Button>
          )}
        </div>
      </button>
    </TooltipProvider>
  );
};

export default ValidationError;
