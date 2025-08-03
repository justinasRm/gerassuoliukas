import { useFormContext } from "react-hook-form";
import { UploadDropzone } from "~/utils/uploadthing";
import type { CreatePostFormData } from "./pages/ZemelapisScreen";
import { twMerge } from "tailwind-merge";

interface Props {
  singleUploadBegin: (fileName: string) => void;
}

export const UploadThingDrop = (props: Props) => {
  const { singleUploadBegin } = props;
  const { setValue, setError } = useFormContext<CreatePostFormData>();

  return (
    <UploadDropzone
      config={{ cn: twMerge }}
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Dropzone upload complete:", res);
        if (res) {
          setValue(
            "photoUrls",
            res.map((r) => r.ufsUrl),
          );
        }
      }}
      onUploadBegin={(fileName: string) => {
        console.log("Upload started for file:", fileName);
        singleUploadBegin(fileName);
      }}
      onUploadError={(error: Error) => {
        console.log("Upload error:", error);
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
              "Kažkas nepavyko. elektra nepraėjo, rezisteris užstrigo, ar dar kas nors, nežinau.\nPerkrauk ir bandyk iš naujo.",
          });
        }
      }}
      appearance={{
        button:
          "ut-ready:bg-[hsl(118,100%,70%)] ut-uploading:bg-[hsl(118,100%,70%)]/50 ut-ready:text-black ut-ready:font-semibold ut-uploading:cursor-not-allowed",
        label: "ut-ready:text-white ut-uploading:text-green-500",
        allowedContent:
          "flex flex-col items-center justify-center m-2 text-white",
        uploadIcon: {
          color: "#6bff66",
        },
        container: "rounded-lg border-2 border-dashed border-green-500",
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
