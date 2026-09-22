import { FC } from 'react';
import { Label } from '@app/components/Label/Label';
import { Separator } from '@app/components/Separator/Separator';
import { formatDate } from '@app/utils/formatDate';

interface PoleMetadataProps {
  pole: any;
}

const PoleMetadata: FC<PoleMetadataProps> = ({ pole }) => {
  return (
    <>
      <section className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Installed At</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">{formatDate(pole?.installed_at)}</p>
      </section>

      <Separator className="my-3" />

      <div className="flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Circuit Protection Equipment</Label>
        {pole?.equipments?.length ? (
          <div className="mt-2.5 flex w-full flex-col text-primary">
            {pole?.equipments?.map((equipment: string, rowIndex: number) => (
              <div key={`${equipment}-${rowIndex}`} className="mt-2.5 flex w-full items-start gap-2.5 first:mt-0">
                <div className="flex-1 shrink basis-0 text-xs text-primary">{equipment}</div>
              </div>
            ))}
          </div>
        ) : 'N/A' }
      </div>

      <Separator className="my-3" />

      <div className="flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Pole Notes</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">{pole?.vegetation_notes || 'N/A'}</p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Device Notes</Label>

        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">{pole?.installation_notes || 'N/A'}</p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Created by</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.created_by ? formatDate(pole?.created_by) : 'N/A'}
        </p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Created at</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.created_at ? formatDate(pole?.created_at) : 'N/A'}
        </p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Updated by</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.updated_by ? formatDate(pole?.updated_by) : 'N/A'}
        </p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Updated at</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.updated_at ? formatDate(pole?.updated_at) : 'N/A'}
        </p>
      </div>

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Status Changed at</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.status_changed_at ? formatDate(pole?.status_changed_at) : 'N/A'}
        </p>
      </div>

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Status Changed by</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.status_changed_by ? formatDate(pole?.status_changed_by) : 'N/A'}
        </p>
      </div>

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Last Date Access Attempted</Label>

        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.last_date_accessed_attempted ? formatDate(pole?.last_date_accessed_attempted) : 'N/A'}
        </p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Number of Active Spans</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">{pole?.enabled_spans_count ?? 0}</p>
      </div>

      <Separator className="my-3" />

      <div className="mb-4 flex w-full flex-col text-xs font-bold">
        <Label className="!text-xss font-bold text-grayShades-shade7">Has_Spans Connected (Yes / No)</Label>
        <p className="mt-2.5 overflow-hidden break-words text-xs text-primary">
          {pole?.has_span_connected ? 'Yes' : 'No'}
        </p>
      </div>
    </>
  );
};

export default PoleMetadata;
