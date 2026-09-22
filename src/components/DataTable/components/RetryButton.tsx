import { SetURLSearchParams } from 'react-router-dom';
import { API } from '@app/lib/api-config';
import { toast } from 'sonner';
import { useState } from 'react';

const retryHandler = async (id: string, setSearchParams?: SetURLSearchParams) => {
  try {
    await API.put(`/status/manual/${id}`);
    setSearchParams?.(() => {
      const updatedParams = new URLSearchParams(globalThis.location.search);
      updatedParams.set('retried_batch_id', id);
      return updatedParams;
    });
    toast.success('Record retried successfully');
  } catch (error: any) {
    console.error('Error during retry operation:', error);
    toast.error(error?.response?.data?.detail ?? 'Error retrying record');
  }
};

const RetryButton = ({
  id,
  setSearchParams,
  isCompleted,
  dataType,
}: {
  id: string;
  setSearchParams?: SetURLSearchParams;
  isCompleted?: boolean;
  dataType?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = async () => {
    setIsLoading(true);
    try {
      await retryHandler(id, setSearchParams);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    !isCompleted &&
    dataType &&
    ['poles', 'edges'].includes(dataType) && (
      <button
        type="button"
        className={`group relative cursor-pointer border-0 bg-transparent p-0 text-accent ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        title="Retry"
        onClick={handleRetry}
        disabled={isLoading}>
        {isLoading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-repeat" />}
      </button>
    )
  );
};

export default RetryButton;
