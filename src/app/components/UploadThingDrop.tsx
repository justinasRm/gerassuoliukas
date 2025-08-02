import { useFormContext } from "react-hook-form";
import { UploadDropzone } from "~/utils/uploadthing";
import type { CreatePostFormData } from "./pages/ZemelapisScreen";
import { twMerge } from "tailwind-merge";

export const UploadThingDrop = () => {
  const { setValue, setError } = useFormContext<CreatePostFormData>();

  return (
    <UploadDropzone
      config={{ cn: twMerge }}
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Dropzone upload complete:", res);
        if (res && res[0]) {
          setValue("photoUrl", res[0].ufsUrl);
        }
      }}
      onUploadError={(error: Error) => {
        console.log("Upload error:", error);
        if (error.message.includes("FileSizeMismatch")) {
          setError("photoUrl", {
            type: "manual",
            message:
              "Seni, persistengei, failas per didelis.\nDaugiausiai 8MB.",
          });
        } else if (error.message.includes("FileCountMismatch")) {
          setError("photoUrl", {
            type: "manual",
            message:
              "Gerai, tu ne Alesius, tiek daug nuotraukų nereikia.\nDaugiausiai 3 nuotraukos.",
          });
        } else {
          setError("photoUrl", {
            type: "manual",
            message:
              "Kažkas nepavyko. elektra nepraėjo, rezisteris užstrigo, ar dar kas nors, nežinau.\nPerkrauk ir bandyk iš naujo.",
          });
        }
      }}
      appearance={{
        button:
          "ut-ready:bg-[hsl(118,100%,70%)] ut-uploading:bg-[hsl(118,100%,70%)] ut-ready:text-black ut-ready:font-semibold ut-uploading:cursor-not-allowed",
        label: "ut-ready:text-white ut-uploading:text-green-500",
        allowedContent:
          "flex flex-col items-center justify-center m-2 text-white",
        uploadIcon: {
          color: "#6bff66",
        },
      }}
      content={{
        label: "Pasirink nuotrauką/as, arba timptelk jas čia",
        allowedContent: "Leidžiamos tik nuotraukos",
        button({ ready, uploadProgress, files }) {
          if (uploadProgress) return `Kraunama: ${uploadProgress}%`;
          if (files.length === 1) return `${files.length} fotkytė`;
          if (files.length > 1) return `${files.length} fotkytės`;
          if (ready) return "Įkelk";
        },
      }}
    />
  );
};
