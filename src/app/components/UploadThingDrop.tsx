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
import { Button } from "./commonUi/Button";
import heic2any from "heic2any";
import imageCompression from "browser-image-compression";

interface FileWithPreview extends File {
  preview: string;
}

export interface UploadThingDropRef {
  uploadFiles: () => Promise<string[]>;
  hasFiles: () => boolean;
}

// ✅ Utility: create readable file error messages
const getFileError = (files: File[]): string | null => {
  if (files.length > 3)
    return "Gerai, tu ne Alesius, tiek daug nuotraukų nereikia.\nDaugiausiai 3 nuotraukos.";

  for (const file of files) {
    const isHeic = file.type === "image/heic" || file.type === "image/heif";
    const isImage =
      file.type.startsWith("image/") ||
      isHeic ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (!isImage)
      return "Tik nuotraukos leidžiamos, ne video ar dokumentai.";

    if (file.size > 8 * 1024 * 1024)
      return "Seni, persistengei, failas per didelis.\nDaugiausiai 8MB.";
  }
  return null;
};

// ✅ Utility: convert HEIC + compress
const processImageFile = async (file: File): Promise<File> => {
  let processedFile = file;

  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (isHeic) {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });
      const blob = Array.isArray(convertedBlob)
        ? convertedBlob[0]
        : convertedBlob;
      if (blob)
        processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
    } catch (e) {
      console.error("HEIC conversion failed:", e);
    }
  }

  try {
    return await imageCompression(processedFile, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: processedFile.type,
    });
  } catch (e) {
    console.error("Image compression failed:", e);
    return processedFile;
  }
};

export const UploadThingDrop = forwardRef<UploadThingDropRef>(
  function UploadThingDrop(_, ref) {
    const { setValue, setError, clearErrors } =
      useFormContext<CreatePostFormData>();
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(0);
    const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(
      null
    );
    const [polaroidRotations, setPolaroidRotations] = useState<number[]>([]);
    const uploadPromiseRef = useRef<{
      resolve: (v: string[] | PromiseLike<string[]>) => void;
      reject: (reason?: unknown) => void;
    } | null>(null);

    const { startUpload } = useUploadThing("imageUploader", {
      onClientUploadComplete: (res) => {
        const urls = res.map((r) => r.ufsUrl);
        setValue("photoUrls", urls);
        setIsUploading(false);
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setFiles([]);
        uploadPromiseRef.current?.resolve(urls);
        uploadPromiseRef.current = null;
      },
      onUploadError: (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
        uploadPromiseRef.current?.reject(error);
        uploadPromiseRef.current = null;

        const message = error.message.includes("FileSizeMismatch")
          ? "Seni, persistengei, failas per didelis.\nDaugiausiai 8MB."
          : error.message.includes("FileCountMismatch")
            ? "Gerai, tu ne Alesius, tiek daug nuotraukų nereikia.\nDaugiausiai 3 nuotraukos."
            : "Kažkas nepavyko. Perkrauk ir bandyk iš naujo.";
        setError("photoUrls", { type: "manual", message });
      },
      onUploadBegin: () => setIsUploading(true),
    });

    const onDrop = useCallback(
      async (accepted: File[]) => {
        const error = getFileError(accepted);
        if (error) {
          setError("photoUrls", { type: "manual", message: error });
          return;
        }

        clearErrors("photoUrls");
        setIsUploading(true);
        try {
          const processed = await Promise.all(accepted.map(processImageFile));
          const withPreview = processed.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          );
          setFiles(withPreview);
          setUploadingImages(withPreview.length);
          setValue(
            "photoUrls",
            withPreview.map((f) => f.preview)
          );
        } catch {
          setError("photoUrls", {
            type: "manual",
            message:
              "Kažkas negerai su nuotraukų apdorojimu. Pabandyk dar kartą.",
          });
        } finally {
          setIsUploading(false);
        }
      },
      [setValue, setError, clearErrors]
    );

    // Use a cryptographically secure PRNG for UI randomness (avoids lint/security warnings)
    const secureRandomBetween = (min: number, max: number) => {
      // Prefer Web Crypto API when available (browsers, modern Node via globalThis.crypto)
      const cryptoObj: Crypto | undefined =
        typeof globalThis !== "undefined" ? (globalThis as unknown as { crypto?: Crypto }).crypto : undefined;
      if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
        const buf = new Uint32Array(1);
        cryptoObj.getRandomValues(buf);
        // Create [0, 1) from 32-bit int without ever reaching 1.0
        const unit = buf[0]! / 4294967296; // 2^32
        return min + (max - min) * unit;
      }
      // Extremely unlikely fallback; still avoids predictable sequence across runs
      // Note: kept for completeness; environments without crypto should be rare here.
      return min + (max - min) * Math.random();
    };

    useEffect(() => {
      setPolaroidRotations(files.map(() => secureRandomBetween(-10, 10)));
      setUploadingImages(0);
    }, [files.length]);

    const uploadFiles = useCallback(async () => {
      if (files.length && !isUploading) {
        return new Promise<string[]>((resolve, reject) => {
          uploadPromiseRef.current = { resolve, reject };
          void startUpload(files);
        });
      }
      return [];
    }, [files, isUploading, startUpload]);

    const hasFiles = useCallback(() => files.length > 0, [files]);

    useImperativeHandle(ref, () => ({ uploadFiles, hasFiles }));

    useEffect(
      () => () => files.forEach((f) => URL.revokeObjectURL(f.preview)),
      [files]
    );

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

    const removeFile = (i: number) => {
      URL.revokeObjectURL(files[i]!.preview);
      const updated = files.filter((_, idx) => idx !== i);
      setFiles(updated);
      setValue("photoUrls", updated.map((f) => f.preview));
      if (!updated.length) clearErrors("photoUrls");
    };

    const renderUploadText = () => {
      if (isUploading) return "Apdorojamos nuotraukos...";
      if (isDragActive) return "Paleisk :)";
      if (files.length)
        return `Pasirinkt${files.length === 1 ? "a" : "os"} ${files.length} nuotrauk${files.length === 1 ? "a" : "os"}`;
      return "Pasirink nuotrauką/as, arba timptelk jas čia";
    };

    return (
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={twMerge(
            "cursor-pointer rounded-lg border-2 border-dashed border-green-500 p-6 text-center transition-colors",
            isDragActive
              ? "border-green-400 bg-green-500/10"
              : "hover:border-green-400 hover:bg-green-500/5"
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
            <div className="text-white">{renderUploadText()}</div>
            <div className="text-sm text-white/70">
              Iki 3 nuotraukų, kiekvienos dydis iki 8MB.
            </div>
            {!files.length && !isUploading && (
              <Button variant="primary" size="sm" className="mt-2" type="button">
                Pasirink failus
              </Button>
            )}
            {isUploading && (
              <div className="mt-2 text-sm text-green-400">Keliama...</div>
            )}
          </div>
        </div>

        {!!files.length && (
          <div className="my-6 px-5">
            <p className="mb-6 text-center text-sm text-white/70">
              {uploadingImages > 0
                ? "Keliama..."
                : `Bus keliam${files.length === 1 ? "a" : "os"} šit${files.length === 1 ? "a" : "os"}:`}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {files.map((file, index) => (
                <div
                  key={`polaroid-${index}`}
                  className={`relative transform cursor-pointer bg-[hsl(118,100%,70%)] p-3 shadow-lg transition-all duration-200 ${enlargedImageIndex === index &&
                    "fixed inset-0 z-50 flex items-center justify-center"
                    }`}
                  style={{
                    transform:
                      enlargedImageIndex === index
                        ? "scale(2) translate(0, 0)"
                        : `rotate(${(polaroidRotations[index] ?? 0).toFixed(2)}deg)`,
                  }}
                  onClick={() =>
                    setEnlargedImageIndex(
                      enlargedImageIndex === index ? null : index
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
                      className="h-32 max-w-42 object-cover sm:max-w-60"
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
        )}
      </div>
    );
  }
);
