import { FC } from 'react';
import SVGIcon from '../SVGIcon';
import { Validation } from '@app/pages/Deployments/components/SideFilters/types';

interface TabProps {
  item: Validation;
  isActive: boolean;
  isDisabled?: boolean;
  isCompleted?: boolean;
  isPending?: boolean;
  handleSelect: (tab: Validation) => void;
}

const Tab: FC<TabProps> = ({ item, isCompleted, isActive, isDisabled, isPending, handleSelect }) => {
  const cursorClass = isDisabled ? '!cursor-not-allowed' : '';
  const borderClass = isActive ? 'border-primary' : 'border-transparent';
  const containerClassName = `${cursorClass} my-auto flex min-h-[40px] flex-1 shrink basis-0 cursor-pointer items-center justify-center gap-2.5 self-stretch border-b-[2px] ${borderClass}`;

  const getTextColorClass = () => {
    if (isCompleted) return 'text-success';
    if (isPending) return 'text-[#C9C7C7]';
    return 'text-primary';
  };

  const textClassName = `text-xs font-medium ${getTextColorClass()}`;

  const handleInteraction = () => {
    if (!isDisabled) {
      handleSelect(item);
    }
  };

  return (
    <div
      role="tab"
      tabIndex={isDisabled ? -1 : 0}
      aria-selected={isActive}
      aria-disabled={isDisabled}
      onClick={handleInteraction}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleInteraction();
        }
      }}
      className={containerClassName}>
      <div className="flex flex-row items-center gap-1">
        <span className={textClassName}>{item.tabTitle}</span>
        {isCompleted && <SVGIcon icon="check" height={11} width={11} color="fill-success" />}
      </div>
    </div>
  );
};

export default Tab;
