import { lazy, Suspense } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
} from "lucide-react";

import type {
  AncientMapEntry,
  MapGeoJsonPayload,
  MapPhotoDialogItem,
} from "@/lib/maps";
import { mapEntryLabel } from "@/lib/maps";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const LazyMapGeoJsonView = lazy(async () => {
  const module = await import("@/components/reader/map-geojson-view");
  return { default: module.MapGeoJsonView };
});

type MapAndPhotoDialogsProps = {
  isMapDialogOpen: boolean;
  activeMapDialogEntry: AncientMapEntry | null;
  isMapDialogLoading: boolean;
  mapDialogError: string | null;
  mapDialogGeoJson: MapGeoJsonPayload | null;
  onMapDialogOpenChange: (open: boolean) => void;
  onCloseMapDialog: () => void;
  isPhotoDialogOpen: boolean;
  currentPhotoDialogItem: MapPhotoDialogItem | null;
  photoDialogIndex: number;
  photoDialogItemsLength: number;
  onPhotoDialogOpenChange: (open: boolean) => void;
  onClosePhotoDialog: () => void;
  onPreviousPhoto: () => void;
  onNextPhoto: () => void;
};

export function MapAndPhotoDialogs({
  isMapDialogOpen,
  activeMapDialogEntry,
  isMapDialogLoading,
  mapDialogError,
  mapDialogGeoJson,
  onMapDialogOpenChange,
  onCloseMapDialog,
  isPhotoDialogOpen,
  currentPhotoDialogItem,
  photoDialogIndex,
  photoDialogItemsLength,
  onPhotoDialogOpenChange,
  onClosePhotoDialog,
  onPreviousPhoto,
  onNextPhoto,
}: MapAndPhotoDialogsProps) {
  return (
    <>
      <AlertDialog open={isMapDialogOpen} onOpenChange={onMapDialogOpenChange}>
        <AlertDialogContent className="h-[min(86vh,900px)] w-[min(98vw,1700px)] max-w-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeMapDialogEntry
                ? mapEntryLabel(activeMapDialogEntry)
                : "Map"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeMapDialogEntry?.types.length
                ? activeMapDialogEntry.types.join(", ")
                : "Location and geometry from the selected map entry."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="min-h-0 flex-1">
            {isMapDialogLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Loading map...
              </p>
            ) : mapDialogError ? (
              <p className="text-sm text-destructive">{mapDialogError}</p>
            ) : mapDialogGeoJson ? (
              <Suspense
                fallback={
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Loading map renderer...
                  </p>
                }
              >
                <LazyMapGeoJsonView
                  geojson={mapDialogGeoJson}
                  className="h-[calc(min(86vh,900px)-12rem)] min-h-96 w-full rounded-md border"
                />
              </Suspense>
            ) : (
              <p className="text-sm text-muted-foreground">No map data found.</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onCloseMapDialog}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPhotoDialogOpen} onOpenChange={onPhotoDialogOpenChange}>
        <AlertDialogContent className="w-[min(98vw,1600px)] max-w-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Photo</AlertDialogTitle>
            <AlertDialogDescription>
              {currentPhotoDialogItem
                ? `${photoDialogIndex + 1} of ${photoDialogItemsLength}`
                : "No photo selected"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {currentPhotoDialogItem ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-md border bg-muted/20">
                <img
                  src={currentPhotoDialogItem.src}
                  alt={currentPhotoDialogItem.alt}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPhotoDialogItem.caption}
              </p>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onPreviousPhoto}
                  disabled={photoDialogItemsLength <= 1}
                >
                  <ChevronLeftIcon className="size-4" />
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground">
                  {photoDialogIndex + 1} / {photoDialogItemsLength}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onNextPhoto}
                  disabled={photoDialogItemsLength <= 1}
                >
                  Next
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photo available.</p>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={onClosePhotoDialog}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
