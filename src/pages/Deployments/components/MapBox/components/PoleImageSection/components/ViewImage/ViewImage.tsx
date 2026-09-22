import { FC, useMemo, useRef, useState } from 'react';
import { FileData, ImageArray } from '@app/store/apis/pole/types';
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import Bullet from '@app/components/Bullet';
import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';
import { RootState } from '@app/store';
import SVGIcon from '@app/components/SVGIcon';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';

interface ViewImageProps {
  images: ImageArray;
  setShowImage: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewImage: FC<ViewImageProps> = ({ images, setShowImage }) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const isMainSidebarCollapsed = useSelector((state: RootState) => state.sidebars.isMainSidebarCollapsed);

  const [selectedImage, setSelectedImage] = useState<FileData | null>(images?.[0] ?? null);
  const [selectedTool, setSelectedTool] = useState<IconNames | null>(null);
  const [panning, setPanning] = useState(true);

  const categorizedImages = useMemo(() => {
    const grouped: Record<string, FileData[]> = {};
    for (const image of images ?? []) {
      const type = image?.extra?.meta_data?.type || 'Other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(image);
    }
    return grouped;
  }, [images]);

  const handleSelectImage = (image: FileData) => {
    if (selectedImage?.file_id !== image.file_id) {
      setSelectedImage(image);

      // Delay resetting transform to ensure state updates properly
      setTimeout(() => {
        transformRef.current?.resetTransform();
        setPanning(true);
      }, 0);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      data-testid="view-image-container"
      className={`fixed inset-0 ${
        isMainSidebarCollapsed ? 'left-[64px]' : 'left-[224px]'
      } top-[64px] z-50 flex bg-black bg-opacity-50 px-8 pt-8 backdrop-blur-sm`}>
      <div className="relative flex w-full flex-row">
        <div className="flex max-h-[calc(100vh-120px)] w-[370px] flex-col gap-4 overflow-y-auto max-md:hidden">
          {Object.entries(categorizedImages).map(([type, typeImages]) => (
            <div key={type} className="flex flex-col gap-2">
              <h3 className="text-red rounded-lg bg-black bg-opacity-10 p-2 text-lg font-bold text-white underline">
                {type?.toUpperCase()}
              </h3>
              {typeImages.map(image => (
                <button
                  key={image.file_id}
                  type="button"
                  className="flex w-full cursor-pointer flex-row flex-nowrap"
                  onClick={() => handleSelectImage(image)}>
                  <div
                    className={`${
                      selectedImage?.file_id === image.file_id && '!bg-[#628FEE] !text-white'
                    } flex h-[44px] w-full flex-row items-center justify-between gap-2 rounded-[3px] bg-white px-4`}>
                    <SVGIcon
                      icon="image"
                      color={selectedImage?.file_id === image.file_id ? 'fill-white' : 'fill-primary'}
                    />
                    <span className="w-16 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">
                      {image.filename}
                    </span>
                    <span className="text-xs font-bold">{format(new Date(image?.uploaded_at), 'dd/MM/yyyy')}</span>
                    <span className="text-xs font-bold">{format(new Date(image?.uploaded_at), 'H:mm:ss')}</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Image Viewer with Zoom Pan Pinch */}
        <div className="flex max-h-[550px] w-full flex-col md:ml-5">
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={10}
            panning={{ disabled: panning }}>
            {({ zoomIn, zoomOut, instance }) => (
              <div className="flex flex-row gap-4 max-sm:flex-wrap max-sm:justify-center md:justify-between">
                <TransformComponent wrapperClass="md:!w-[100%] mx-2">
                  <img
                    src={selectedImage?.url}
                    alt="pole"
                    className="rounded-md object-contain md:h-[550px] md:w-full"
                  />
                </TransformComponent>

                {/* Zoom & Drag Controls */}
                <div className="flex flex-row gap-2">
                  <div className="flex h-[44px] flex-row items-center justify-between gap-5 rounded-[5px] bg-white px-4">
                    <button
                      type="button"
                      className="cursor-pointer"
                      data-testid="zoom-in"
                      onClick={() => {
                        const newScale = instance.transformState.scale + 0.5;
                        zoomIn();
                        setPanning(newScale < 1);
                        setSelectedTool('zoom-in');
                      }}>
                      <SVGIcon icon="zoom-in" color={selectedTool === 'zoom-in' ? 'fill-[#628FEE]' : 'fill-primary'} />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer"
                      data-testid="zoom-out"
                      onClick={() => {
                        const newScale = instance.transformState.scale - 0.5;
                        zoomOut();
                        setPanning(newScale < 1);
                        setSelectedTool('zoom-out');
                      }}>
                      <SVGIcon
                        icon="zoom-out"
                        color={selectedTool === 'zoom-out' ? 'fill-[#628FEE]' : 'fill-primary'}
                      />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer"
                      data-testid="download"
                      onClick={() => selectedImage?.url && handleDownload(selectedImage.url)}>
                      {selectedImage?.url && (
                        // <a href={selectedImage.url} target="_blank">
                        <SVGIcon icon="download" color={'fill-primary'} />
                        // </a>
                      )}
                    </button>
                  </div>
                  <Bullet
                    data-testid="view-image-cross-button"
                    className="!h-[44px] !w-[44px] cursor-pointer !rounded-[3px] bg-white"
                    onClick={() => setShowImage(false)}>
                    <SVGIcon icon="cross" height={12} width={12} />
                  </Bullet>
                </div>
              </div>
            )}
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
};

export default ViewImage;
