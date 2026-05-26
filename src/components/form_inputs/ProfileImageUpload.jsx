import { useCallback, useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Upload, X } from "lucide-react";
import { Input } from "../ui/input";

async function getCroppedImg(imageSrc, cropPixels, fileName = "profile.jpg") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Crop failed"));
        const file = new File([blob], fileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve(file);
      },
      "image/jpeg",
      0.92,
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

export function ProfileImageUpload({
  name,
  control,
  rules,
  disabled = false,
  defaultImage,
  onRemove,
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isDefaultHidden, setIsDefaultHidden] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsDefaultHidden(false);
  }, [defaultImage]);

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const previewUrl = URL.createObjectURL(file);
    setImageSrc(previewUrl);
    setCropOpen(true);
  };

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = async (onChange) => {
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      onChange(croppedFile);

      const previewUrl = URL.createObjectURL(croppedFile);
      setImagePreview(previewUrl);

      setIsDefaultHidden(true);
      setCropOpen(false);

      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageRemove = (onChange) => {
    onChange(null);
    setImagePreview(null);
    setIsDefaultHidden(true);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onRemove) {
      onRemove();
    }
  };

  const handleDrop = (e, onChange) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleImageSelect(files[0], onChange);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange } }) => {
          const currentImage =
            imagePreview ||
            (typeof value === "string" ? value : null) ||
            (!isDefaultHidden ? defaultImage : null);

          const showRemoveButton = Boolean(currentImage);

          return (
            <div className="flex flex-col items-center gap-4 w-full">
              <div
                className="
                  relative
                  w-28 h-28
                  rounded-full
                  border-4 border-gray-300
                  flex items-center justify-center
                  cursor-pointer
                  hover:border-emerald-500 hover:bg-emerald-50
                  transition overflow-hidden
                  shrink-0
                "
                onDrop={(e) => handleDrop(e, onChange)}
                onDragOver={handleDragOver}
                onClick={() => !disabled && fileInputRef.current?.click()}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files?.[0])}
                  className="hidden"
                  disabled={disabled}
                />

                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-1 px-2">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                      Upload Photo
                    </p>
                  </div>
                )}
              </div>

              {showRemoveButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleImageRemove(onChange)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 cursor-pointer"
                >
                  <X className="w-4 h-4 mr-1" /> Remove Photo
                </Button>
              )}

              <Dialog open={cropOpen} onOpenChange={setCropOpen}>
                <DialogContent
                  className="
                    w-[95vw]
                    sm:max-w-xl
                    p-4 sm:p-6
                    rounded-2xl
                  "
                >
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                      Crop profile photo
                    </DialogTitle>
                  </DialogHeader>

                  <div className="relative w-full h-[260px] sm:h-[360px] bg-black/80 rounded-xl overflow-hidden">
                    {imageSrc && (
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm mb-2 font-medium text-gray-700">
                        Zoom
                      </p>
                      <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(val) => setZoom(val[0])}
                        className="
                          [&_[role=slider]]:border-emerald-600
                          [&_[role=slider]]:bg-emerald-600
                          [&_[data-orientation=horizontal]_.bg-primary]:bg-emerald-600
                        "
                      />
                    </div>
                  </div>

                  <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCropOpen(false);
                        setImageSrc(null);
                      }}
                      className="w-full sm:w-auto rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-all duration-200 hover:bg-red-100 hover:text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 cursor-pointer"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleCropConfirm(onChange)}
                      className="
                        w-full sm:w-auto
                        bg-emerald-600
                        hover:bg-emerald-700
                        text-white
                        rounded-full
                        px-4 py-2
                        font-medium
                        text-sm
                        shadow-sm
                        hover:shadow-md
                        transition-all
                        duration-200
                        active:scale-95
                        cursor-pointer
                        disabled:opacity-70
                        disabled:cursor-not-allowed
                      "
                    >
                      Use Photo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        }}
      />
    </>
  );
}

export default ProfileImageUpload;
