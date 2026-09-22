import React, { FC } from 'react';

import SelectDropdown from '@app/components/SelectDropdown';
import { poleImageTypes } from '../../../../MapBox.utils';

interface ImageActionsProps {
  imageType: string;
  handleImageType: (value: string) => void;
}

const ImageActions: FC<ImageActionsProps> = ({ imageType, handleImageType }) => {
  return (
    <div className="absolute bottom-12 w-full">
      <div className="ml-3 flex flex-row items-center gap-2">
        <button type="button" className="min-w-16" onClick={ev => ev.stopPropagation()}>
          <SelectDropdown
            selectedValue={`${imageType} Photo`}
            options={poleImageTypes}
            onSelect={value => handleImageType(value)}
            triggerClassName="!bg-[#373737] !bg-opacity-70"
            arrowClassName="!-rotate-[360deg]"
            arrowColor="fill-white"
            textColor="text-white"
          />
        </button>
      </div>
    </div>
  );
};

export default ImageActions;
