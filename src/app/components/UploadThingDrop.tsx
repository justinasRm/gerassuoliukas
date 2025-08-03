import { useFormContext } from "react-hook-form";
import { useDropzone } from "@uploadthing/react";
import { useUploadThing } from "~/utils/uploadthing";
import type { CreatePostFormData } from "./pages/ZemelapisScreen";
import { twMerge } from "tailwind-merge";
import {
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Button } from "./ui/Button";
import heic2any from "heic2any";
import imageCompression from "browser-image-compression";

interface FileWithPreview extends File {
  preview: string;
}

export interface UploadThingDropRef {
  uploadFiles: () => Promise<string[]>;
  hasFiles: () => boolean;
}

export const UploadThingDrop = forwardRef<UploadThingDropRef>(
  function UploadThingDrop(_, ref) {
    const { setValue, setError, clearErrors } =
      useFormContext<CreatePostFormData>();
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const uploadPromiseRef = useRef<{
      resolve: (value: string[] | PromiseLike<string[]>) => void;
      reject: (reason?: unknown) => void;
    } | null>(null);
    const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(
      null,
    );
    const [polaroidRotations, setPolaroidRotations] = useState<number[]>([]);
    const [uploadingImages, setUploadingImages] = useState<number>(0);

    const { startUpload } = useUploadThing("imageUploader", {
      onClientUploadComplete: (res) => {
        const uploadedUrls = res.map((r) => r.ufsUrl);
        setValue("photoUrls", uploadedUrls);
        setIsUploading(false);
        files.forEach((file) => URL.revokeObjectURL(file.preview));
        setFiles([]);

        if (uploadPromiseRef.current) {
          uploadPromiseRef.current.resolve(uploadedUrls);
          uploadPromiseRef.current = null;
        }
      },
      onUploadError: (error: Error) => {
        console.log("Upload error:", error);
        setIsUploading(false);

        if (uploadPromiseRef.current) {
          uploadPromiseRef.current.reject(error);
          uploadPromiseRef.current = null;
        }

        if (error.message.includes("FileSizeMismatch")) {
          setError("photoUrls", {
            type: "manual",
            message:
              "Seni, persistengei, failas per didelis.\nDaugiausiai 8MB.",
          });
        } else if (error.message.includes("FileCountMismatch")) {
          setError("photoUrls", {
            type: "manual",
            message:
              "Gerai, tu ne Alesius, tiek daug nuotraukų nereikia.\nDaugiausiai 3 nuotraukos.",
          });
        } else {
          setError("photoUrls", {
            type: "manual",
            message:
              "Kažkas nepavyko. elektra dingo, rezisteris sprogo, ar dar kas nors, nežinau.\nPerkrauk ir bandyk iš naujo.",
          });
        }
      },
      onUploadBegin: () => {
        setIsUploading(true);
      },
    });

    const validateFiles = (filesToValidate: File[]): string | null => {
      if (filesToValidate.length > 3) {
        return "Gerai, tu ne Alesius, tiek daug nuotraukų nereikia.\nDaugiausiai 3 nuotraukos.";
      }

      for (const file of filesToValidate) {
        const isImage =
          file.type.startsWith("image/") ||
          file.type === "image/heic" ||
          file.type === "image/heif" ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif");

        if (!isImage) {
          return "Tik nuotraukos leidžiamos, ne video ar dokumentai.";
        }

        if (file.size > 8 * 1024 * 1024) {
          return "Seni, persistengei, failas per didelis.\nDaugiausiai 8MB.";
        }
      }

      return null;
    };

    const processImage = async (file: File): Promise<File> => {
      let processedFile = file;

      // Convert HEIC to JPEG if needed
      if (
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")
      ) {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });

          const blob = Array.isArray(convertedBlob)
            ? convertedBlob[0]
            : convertedBlob;
          if (blob) {
            processedFile = new File(
              [blob],
              file.name.replace(/\.(heic|heif)$/i, ".jpg"),
              {
                type: "image/jpeg",
                lastModified: file.lastModified,
              },
            );
          }
        } catch (error) {
          console.error("HEIC conversion failed:", error);
        }
      }

      try {
        const compressedFile = await imageCompression(processedFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: processedFile.type,
        });

        return compressedFile;
      } catch (error) {
        console.error("Image compression failed:", error);
        return processedFile; // Return original if compression fails
      }
    };

    const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        const validationError = validateFiles(acceptedFiles);
        if (validationError) {
          setError("photoUrls", {
            type: "manual",
            message: validationError,
          });
          return;
        }

        clearErrors("photoUrls");
        setIsUploading(true); // Show loading state during processing

        try {
          // Process all images (HEIC conversion + compression)
          const processedFiles = await Promise.all(
            acceptedFiles.map(processImage),
          );

          const filesWithPreview = processedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          );

          setFiles(filesWithPreview);
          setUploadingImages(filesWithPreview.length);

          // Set temporary preview URLs in the form for display
          setValue(
            "photoUrls",
            filesWithPreview.map((file) => file.preview),
          );
        } catch (error) {
          console.error("Image processing failed:", error);
          setError("photoUrls", {
            type: "manual",
            message:
              "Kažkas negerai su nuotraukų apdorojimu. Pabandyk dar kartą.",
          });
        } finally {
          setIsUploading(false);
        }
      },
      [setValue, setError, clearErrors],
    );

    useEffect(() => {
      setPolaroidRotations(files.map(() => Math.random() * 20 - 10));
      setUploadingImages(0);
    }, [files.length]);

    const uploadFiles = useCallback(async (): Promise<string[]> => {
      if (!isUploading) {
        console.log("Starting upload of files:", files);

        return new Promise<string[]>((resolve, reject) => {
          uploadPromiseRef.current = { resolve, reject };
          void startUpload(files);
        });
      }
      return []; // Return empty array if no files to upload
    }, [files, isUploading, startUpload]);

    const hasFiles = useCallback(() => {
      return files.length > 0;
    }, [files]);

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
      uploadFiles,
      hasFiles,
    }));

    // Clean up preview URLs when component unmounts
    useEffect(() => {
      return () => {
        files.forEach((file) => URL.revokeObjectURL(file.preview));
      };
    }, [files]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        ...generateClientDropzoneAccept(["image/*"]),
        "image/heic": [".heic"],
        "image/heif": [".heif"],
      },
      multiple: true,
      maxFiles: 3,
    });

    const removeFile = (indexToRemove: number) => {
      const updatedFiles = files.filter((_, index) => index !== indexToRemove);

      // Revoke the URL for the removed file
      URL.revokeObjectURL(files[indexToRemove]!.preview);

      setFiles(updatedFiles);
      setValue(
        "photoUrls",
        updatedFiles.map((file) => file.preview),
      );

      if (updatedFiles.length === 0) {
        clearErrors("photoUrls");
      }
    };

    return (
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={twMerge(
            "cursor-pointer rounded-lg border-2 border-dashed border-green-500 p-6 text-center transition-colors",
            isDragActive
              ? "border-green-400 bg-green-500/10"
              : "hover:border-green-400 hover:bg-green-500/5",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-green-500">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-white">
              {isUploading
                ? "Apdorojamos nuotraukos..."
                : isDragActive
                  ? "Paleisk :)"
                  : files.length > 0
                    ? `Pasirinkt${files.length === 1 ? "a" : "os"} ${files.length} nuotrauk${files.length === 1 ? "a" : "os"}`
                    : "Pasirink nuotrauką/as, arba timptelk jas čia"}
            </div>
            <div className="text-sm text-white/70">
              Iki 3 nuotraukų, kiekvienos dydis iki 8MB.
            </div>
            {files.length === 0 && !isUploading && (
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                type="button"
              >
                Pasirink failus
              </Button>
            )}
            {isUploading && (
              <div className="mt-2 text-sm text-green-400">Keliama...</div>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="my-6 px-5">
            <div>
              <p className="mb-6 text-center text-sm text-white/70">
                {uploadingImages > 0
                  ? "Keliama..."
                  : `Bus keliam${files.length === 1 ? "a" : "os"} šit${files.length === 1 ? "a" : "os"}:`}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {files.map((file, index) => (
                  <div
                    key={`polaroid-${index}`}
                    className={`relative transform cursor-pointer bg-[hsl(118,100%,70%)] p-3 shadow-lg transition-all duration-200 ${
                      enlargedImageIndex === index &&
                      "fixed inset-0 z-50 flex items-center justify-center"
                    }`}
                    style={{
                      transform:
                        enlargedImageIndex === index
                          ? "scale(2) translate(0, 0)"
                          : `rotate(${polaroidRotations[index] || Math.random() * 20 - 10}deg)`,
                    }}
                    onClick={() =>
                      setEnlargedImageIndex(
                        enlargedImageIndex === index ? null : index,
                      )
                    }
                  >
                    <div
                      className={
                        enlargedImageIndex === index
                          ? "relative flex flex-col justify-center"
                          : "flex flex-col justify-center"
                      }
                    >
                      <img
                        src={file.preview}
                        alt={`Suoliukas ${index + 1}`}
                        className={`h-32 max-w-42 object-cover sm:max-w-60`}
                      />
                      <div className="mt-2 text-center text-xs font-black text-gray-800">
                        Suoliukas #{index + 1}
                      </div>
                      <div className="text-center text-xs font-medium text-gray-800">
                        {new Date().toLocaleDateString("lt-LT")}
                      </div>
                      {enlargedImageIndex === index && (
                        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(118,100%,70%)] text-xs font-bold text-black">
                          ✕
                        </div>
                      )}
                    </div>
                    {/* Remove button for non-enlarged images */}
                    {enlargedImageIndex !== index && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-green-700 font-black text-white hover:bg-green-900"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {enlargedImageIndex !== null && (
                <div
                  className="fixed inset-0 z-40 bg-black/80"
                  onClick={() => setEnlargedImageIndex(null)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);
