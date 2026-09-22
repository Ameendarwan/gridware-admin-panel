import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@app/components/Carousel/Carousel';
import { FileData, ImageArray, Pole } from '@app/store/apis/pole/types';
import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  setIsMovingPole,
  setPoleSidebarCloseClicked,
  setSearchTerm,
  setSelectedPoleIdForValidation,
} from '@app/store/slices/polesSlice';
import { setMode, setSelectedFromPole, setSelectedPoleEdges, setSelectedToPole } from '@app/store/slices/edgesSlice';
import { useDispatch, useSelector } from 'react-redux';

import Bullet from '@app/components/Bullet';
import { Button } from '@app/components/Button/Button';
import ConfirmationDialog from '@app/components/ConfirmationDialog';
import { IconNames } from '@app/components/SVGIcon/SVGIcon.utils';
import ImageActions from './components/ImageActions';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import OptionsListSection from '../OptionsListSection';
import { RootState } from '@app/store';
import SVGIcon from '@app/components/SVGIcon';
import SelectDropdown from '@app/components/SelectDropdown';
import { Separator } from '@app/components/Separator/Separator';
import TruncatedTextCell from '@app/components/TruncateText/TruncateText';
import ViewImage from './components/ViewImage';
import { handleOpenGoogleMap, poleImageTypes } from '../../MapBox.utils';
import noImage from '@app/assets/no-image.svg';
import { useSearchParams } from 'react-router-dom';

interface PoleImageSectionProps {
  pole: Pole | null;
  selectedFiles?: File[];
  setSelectedFiles?: React.Dispatch<React.SetStateAction<File[]>>;
  selectedImageTypes?: string[];
  setSelectedImageTypes?: React.Dispatch<React.SetStateAction<string[]>>;
  setDeletedFilesIds?: React.Dispatch<React.SetStateAction<string[]>>;
  disableUpload: boolean;
  isPoleAddMode?: boolean;
  handleEditPole?: () => void;
  handleUploadFiles?: () => void;
  poleIconName: IconNames;
}

const PoleImageSection: FC<PoleImageSectionProps> = ({
  pole,
  selectedFiles,
  setSelectedFiles,
  selectedImageTypes,
  setSelectedImageTypes,
  setDeletedFilesIds,
  disableUpload,
  isPoleAddMode,
  handleEditPole,
  handleUploadFiles,
  poleIconName,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.edges.mode);
  const fileInputRef = useRef(null);

  const [showAllImages, setShowAllImages] = useState(false);
  const [displayImageType, setDisplayImageType] = useState('pole');
  const [filteredImages, setFilteredImages] = useState<ImageArray>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [carouselCurrentImageIndex, setCarouselCurrentImageIndex] = useState(0);
  const [showUploadedFiles, setShowUploadedFiles] = useState(false);

  useEffect(() => {
    /**
     * Effect hook that updates the carousel index and listens for carousel selection changes.
     * - When the `api` is initialized, it sets the initial carousel image index based on the selected scroll snap.
     * - The `select` event listener updates the current image index whenever a new image is selected in the carousel.
     */
    if (!api) {
      return;
    }
    setCarouselCurrentImageIndex(api.selectedScrollSnap() + 1);
    api.on('select', () => {
      setCarouselCurrentImageIndex(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    /**
     * Effect hook that filters and sets images when the `pole` object changes.
     * - Updates the `filteredImages` state with the images from the `pole` object.
     * - Calls the `handleDisplayImagesByType` function to display images based on the first image's type (e.g., 'pole').
     */
    setFilteredImages(pole?.images ?? []);
    if (pole?.id) dispatch(setSelectedFromPole(pole?.id));
  }, [pole]);

  const handleImageView = () => {
    /**
     * Function to handle the action when an image view is triggered.
     * - If the first image in the pole has a valid URL, it sets the state to show all images.
     */
    if (pole?.images?.[0]?.url) setShowAllImages(true);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    /**
     * Function to handle file upload input.
     * - Sets the selected files into the `selectedFiles` state.
     * - If no image types are selected, it sets the default image type as 'pole' for each selected file.
     * @param {ChangeEvent<HTMLInputElement>} event - The file input change event containing the selected files.
     */
    const files = event.target?.files;
    if (files?.length) {
      setSelectedFiles?.(Array.from(files));

      setSelectedImageTypes?.(new Array(files.length).fill('pole').map(type => type) ?? []);

      setShowUploadedFiles(true);
    }
  };

  const triggerFileInput = (fileInputRef: React.RefObject<HTMLInputElement>) => {
    /**
     * Function to trigger the file input dialog programmatically.
     * - This allows for triggering the file input element's click event without requiring user interaction.
     * @param {React.RefObject<HTMLInputElement>} fileInputRef - Reference to the file input element.
     */
    fileInputRef.current?.click(); // Programmatically click the file input element
  };

  const handleDeleteImage = useCallback(
    (deletedImage: FileData) => {
      /**
       * Function to handle the deletion of an image.
       * - Finds the image in the `pole.images` array by matching the image's type and file ID.
       * - Updates the `setDeletedFilesIds` state to track deleted image file IDs and prevent duplicates.
       * @param {FileData} deletedImage - The image data to be deleted.
       */
      const findImage = pole?.images?.find(
        image =>
          image?.extra.meta_data.type === deletedImage.extra.meta_data.type && image?.file_id === deletedImage.file_id
      );
      // If the image to be deleted is found, update the deleted files state to prevent duplicates
      if (findImage?.file_id) {
        setDeletedFilesIds?.(prevState => {
          // Ensure no duplicates using a Set
          const updatedSet = new Set([...prevState, findImage?.file_id]);
          return Array.from(updatedSet); // Convert Set back to array
        });
      }
    },
    [carouselCurrentImageIndex, displayImageType]
  );

  const handleSelectImageType = (value: string, index: number) => {
    /**
     * Function to handle the selection of an image type (e.g., 'pole', 'transmission').
     * - Updates the `selectedImageTypes` state by modifying the type for the selected index.
     * @param {string} value - The selected image type value.
     * @param {number} index - The index of the selected image type.
     */
    setSelectedImageTypes?.((prevState: string[]) => {
      const newState = [...prevState];
      newState[index] = value;
      return newState;
    });
  };

  const handleDisplayImagesByType = useCallback(
    (type: string) => {
      /**
       * Function to filter and display images by their type (e.g., 'pole', 'transmission').
       * - Filters the images from the `pole.images` array based on the selected type and updates the `filteredImages` state.
       * @param {string} type - The image type to filter by (e.g., 'pole', 'transmission').
       */
      const items = pole?.images?.filter(image => image?.extra?.meta_data?.type === type);
      setFilteredImages(items?.length ? items : []);
      setDisplayImageType(type);
    },
    [mode, pole?.images]
  );

  const handleRemoveFile = (fileName: string) => {
    /**
     * Function to handle file removal.
     * - Removes the file and its associated image type from the selected files and image types state.
     * @param {string} fileName - The name of the file to be removed.
     */
    const index = selectedFiles?.findIndex(file => file.name === fileName);
    if (index !== undefined && index > -1) {
      const items = [...(selectedImageTypes ?? [])];
      items.splice(index, 1);
      setSelectedImageTypes?.(items);
    }
    setSelectedFiles?.(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleCloseClick = () => {
    /**
     * Function to handle closing the current view.
     * - Dispatches the action to reset the map mode to "NOVIEW".
     * - Resets the search parameters in the URL.
     */
    dispatch(setMode(MapMode.NOVIEW));

    // Preserve 'test-mode' query param if present, remove others
    const testMode = searchParams.get('test-mode');
    const newParams: Record<string, string> = {};
    if (testMode) newParams['test-mode'] = testMode;
    setSearchParams(newParams);

    dispatch(setSearchTerm(''));
    dispatch(setSelectedPoleIdForValidation(-1));
    dispatch(setSelectedFromPole(0));
    dispatch(setSelectedToPole(0));
    dispatch(setSelectedPoleEdges([]));
    dispatch(setPoleSidebarCloseClicked(true));
    dispatch(setIsMovingPole(false));
  };

  useEffect(() => {
    handleDisplayImagesByType('pole');
  }, [pole]);

  useEffect(() => {
    if ((selectedFiles?.length ?? 1) < 1) setShowUploadedFiles(false);
  }, [selectedFiles]);

  const handleDisplayAllImages = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setShowAllImages(true);
  };

  const isEditable = mode === MapMode.POLEEDIT;

  return (
    <>
      <div className="relative z-50 min-h-10 shadow-lg">
        <div className="fixed z-50 flex min-h-[36px] w-[300px] flex-row items-center gap-4 bg-white px-3 py-2 shadow-lg">
          <div className="flex w-full items-center gap-1.5 self-stretch">
            <SVGIcon icon={poleIconName} width={20} height={20} />
            <div className="flex w-full rounded-[3px] bg-grayShades-shade1 py-1 pl-2">
              <TruncatedTextCell
                value={pole?.pole_id ?? 'N/A'}
                trimSize={10}
                className="text-xs font-bold text-black"
              />
            </div>
          </div>

          <div className="flex flex-row items-center gap-3">
            <SVGIcon
              icon="pole-locate"
              color="fill-primary"
              className="!cursor-pointer"
              onClick={() => handleOpenGoogleMap(pole?.lat ?? 0, pole?.long ?? 0)}
            />

            <div className="flex">
              <SVGIcon
                icon="camera"
                data-testid="camera-button"
                color={'fill-primary'}
                onClick={() => !disableUpload && triggerFileInput(fileInputRef)}
                className={`flex ${disableUpload ? 'cursor-not-allowed' : 'cursor-pointer'} m-0 bg-transparent p-0`}
              />

              <input
                disabled={disableUpload}
                type="file"
                data-testid="file-input"
                ref={fileInputRef}
                multiple
                className="hidden"
                accept=".jpeg, .jpg, .png, .pdf, .mp4"
                onChange={handleFileUpload}
              />
            </div>
            {!isPoleAddMode && (
              <Bullet
                title="Edit Pole"
                className={`min-w-[24px] !rounded-[6px] transition-all duration-700 ${isEditable ? 'bg-primary p-3' : '!bg-white p-0'}`}
                onClick={handleEditPole}>
                <SVGIcon icon="edit-pencil" color={isEditable ? 'fill-white' : 'fill-primary'} />
              </Bullet>
            )}

            <Bullet className="m-0 p-0" data-testid="image-section-cross-button" onClick={handleCloseClick}>
              <SVGIcon icon="cross" color="fill-primary" className="cursor-pointer transition-all duration-1000" />
            </Bullet>
          </div>
        </div>
      </div>
      {showAllImages && <ViewImage setShowImage={setShowAllImages} images={pole?.images ?? []} />}

      <button
        type="button"
        className="relative z-10 mt-2 w-full cursor-pointer px-2 transition-opacity duration-1000"
        onClick={handleImageView}>
        {filteredImages?.length ? (
          <Carousel
            setApi={setApi}
            onClick={ev => ev.stopPropagation()}
            opts={{
              align: 'start',
            }}
            className="w-full">
            <CarouselContent>
              {filteredImages?.map((image, index) => (
                <CarouselItem key={image.file_id || `image-${index}`} className="max-w-max">
                  <img
                    data-testid="pole-images"
                    loading="lazy"
                    src={image?.url}
                    alt="Pole details"
                    onClick={handleDisplayAllImages}
                    className="aspect-[1.31] !min-h-[224px] w-full rounded-lg"
                  />
                  {!isPoleAddMode && (
                    <ImageActions imageType={displayImageType} handleImageType={handleDisplayImagesByType} />
                  )}
                  <div className="flex w-full flex-row items-center justify-between pb-1">
                    <CarouselPrevious className="relative bg-white" />
                    <div className="flex flex-row items-center gap-1.5">
                      {mode === MapMode.POLEEDIT && (
                        <button type="button" onClick={ev => ev.stopPropagation()} className="bg-transparent p-0">
                          <ConfirmationDialog
                            title="Delete image"
                            description="Are you sure you want to delete this image?"
                            triggerComponent={
                              <button
                                type="button"
                                data-testid="delete-image-button"
                                className="cursor-pointer bg-transparent p-0">
                                <SVGIcon icon="delete" color="fill-white" height={12} width={10} />
                              </button>
                            }
                            confirmationComponent={
                              <Button
                                type="button"
                                variant="destructive"
                                className="rounded bg-redShades-shade1"
                                onClick={() => handleDeleteImage(image)}>
                                Yes, delete
                              </Button>
                            }
                          />
                        </button>
                      )}
                      <Bullet
                        onClick={ev => {
                          ev.stopPropagation();
                          setShowUploadedFiles(prev => !prev);
                        }}
                        disabled={disableUpload || !selectedFiles?.length}
                        className="bg-transparent">
                        <SVGIcon icon="image" color="fill-label" />
                      </Bullet>
                    </div>
                    <CarouselNext className="!relative bg-white" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <>
            <div className="relative h-[235px] w-full bg-white">
              <img
                data-testid="no-image"
                loading="lazy"
                src={noImage}
                alt="Pole details"
                className="aspect-[1.31] w-full rounded-none"
              />
              {!isPoleAddMode && (
                <ImageActions imageType={displayImageType} handleImageType={handleDisplayImagesByType} />
              )}
            </div>
            <div className="flex w-full flex-row items-center justify-center pb-1">
              <Bullet
                onClick={ev => {
                  ev.stopPropagation();
                  setShowUploadedFiles(prev => !prev);
                }}
                disabled={disableUpload || !selectedFiles?.length}>
                <SVGIcon icon="image" color="fill-label" />
              </Bullet>
            </div>
          </>
        )}
      </button>
      {showUploadedFiles && (
        <OptionsListSection
          title="Photos"
          className="!pt-0"
          setShowOptions={setShowUploadedFiles}
          buttonTitle="Save Changes and Close"
          onSaveClick={isPoleAddMode ? () => setShowUploadedFiles(false) : handleUploadFiles}>
          {selectedFiles?.length && (
            <div className="grid grid-cols-2 gap-4 py-3">
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${file.size}-${index}`} className="flex flex-col gap-2">
                  {file.type.startsWith('image/') ? (
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.name)}
                        className="absolute right-1 top-1 flex cursor-pointer flex-row items-center rounded-full bg-primary p-1"
                        aria-label="Remove file">
                        <SVGIcon icon="cross" color="fill-white" className="!h-3.5 !w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-secondary">Preview not available for {file.type}</p>
                  )}
                  <SelectDropdown
                    selectedValue={selectedImageTypes?.[index] ?? 'pole'}
                    options={poleImageTypes}
                    onSelect={value => handleSelectImageType(value, index)}
                  />
                </div>
              ))}
            </div>
          )}
        </OptionsListSection>
      )}
      <div className="px-4 pb-4">
        <Separator />
      </div>
    </>
  );
};

export default PoleImageSection;
