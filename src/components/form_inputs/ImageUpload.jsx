import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useRef } from "react";

export function ImageUpload({ name, control, rules }) {
  const fileInputRef = useRef(null);

  const createPreview = (fileArray) => {
    return fileArray.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value = [], onChange } }) => {
        const previewList = Array.isArray(value) ? createPreview(value) : [];

        // SELECT FILES
        const handleImageSelect = (files) => {
          const fileArray = Array.from(files || []);
          if (!fileArray.length) return;

          onChange(fileArray);
        };

        // REMOVE SINGLE FILE (FIXED)
        const handleImageRemove = (index) => {
          const updated = [...value];
          updated.splice(index, 1);
          onChange(updated);
        };

        const handleDrop = (e) => {
          e.preventDefault();
          handleImageSelect(e.dataTransfer.files);
        };

        const handleDragOver = (e) => e.preventDefault();

        return (
          <div className="flex gap-3">
            {/* UPLOAD BOX */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg w-32 h-32 flex flex-col items-center justify-center text-center p-2",
                "hover:border-primary/50 hover:bg-muted/50",
                "focus-within:border-primary focus-within:bg-muted/50",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4"
                multiple
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files)}
              />

              {!value.length ? (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-muted-foreground" />
                  <p className="text-xs">Upload</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-xs">
                  {value[0]?.type?.startsWith("video/") ? (
                    <Video className="w-4 h-4 text-emerald-600 mb-1" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-green-600 mb-1" />
                  )}

                  <span className="truncate max-w-[90px]">
                    {value[0]?.name}
                    {value.length > 1 ? ` +${value.length - 1}` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* PREVIEW */}
            <div className="border rounded-lg overflow-hidden relative w-32 h-32">
              {previewList.length === 1 ? (
                <div className="relative w-full h-full">
                  {previewList[0].type.startsWith("video/") ? (
                    <video
                      src={previewList[0].url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={previewList[0].url}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleImageRemove(0)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : previewList.length > 1 ? (
                <div className="grid grid-cols-2 gap-1 p-1 w-full h-full">
                  {previewList.map((item, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded"
                    >
                      {item.type.startsWith("video/") ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={item.url}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
