"use client";
import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Loading from "./loading";
import { mutate } from "swr";
import { Pencil, CircleX, Upload, Trash } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Input } from "./ui/input";

export default function EditProfileImageMoadal({ url }: { url: string }) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<File>();
  const [previewImage, setPreviewImage] = useState<string>(url);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setPreviewImage(url);
    setImage(undefined);
  }, [open]);
  const onDrop = useCallback((acceptedFile: File[]) => {
    setImage(acceptedFile[0]);
    setPreviewImage(URL.createObjectURL(acceptedFile[0]));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeFile = () => {
    setImage(undefined);
    setPreviewImage(url);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("id", userId as string);
    formData.append("file", image as File);
    setLoading(true);
    await axios
      .patch(`/api/candidate/image`,formData)
      .then(({ data }) => {
        if (data.success) {
          mutate(`/api/candidate/${userId}`);
          setOpen(false);
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex flex-row items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--mygreen)]">
        <Pencil className="h-3 w-3 text-[var(--mygreen)]" />
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center max-h-screen border-0 items-center p-2 sm:p-4 sm:max-w-100 max-w-screen">
        <DialogHeader className="w-full">
          <DialogTitle className="text-sm text-start">Edit ?</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 w-full overflow-y-auto">
          {previewImage && (
            <div className="relative w-20 h-20">
              {previewImage !== url && (
                <CircleX
                  onClick={removeFile}
                  className="h-4 w-4 text-[var(--mygreen)] hover:text-red-500 absolute top-0 z-2 right-0"
                />
              )}
              <Image
                src={previewImage}
                alt={`profile-image`}
                layout="fill"
                objectFit="cover"
                className="rounded shadow"
                unoptimized // 🔥 Required for object URLs
              />
            </div>
          )}
          <div {...getRootProps()} className="">
            <Input {...getInputProps()} />
            <div className="flex flex-col gap-y-2 border-1 items-center mt-4 border-stone-400 p-2 rounded-xl">
              {isDragActive ? (
                <p className="text-sm">Drop the files here ...</p>
              ) : (
                <p className="text-sm">
                  Drag drop some files here, or click to select files
                </p>
              )}
              <Upload className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          <Button
            disabled={!image?.name}
            onClick={handleUpdate}
            variant="outline"
            className="w-full bg-[var(--mygreen)] text-white mt-10"
          >
            {loading&&!(previewImage === url) ? <Loading color="white" /> : "upload"}
          </Button>
          <Button
            disabled={!(previewImage === url)|| !url}
            onClick={handleUpdate}
            variant="secondary"
            className="w-full border-2 border-red-500 text-red-500 mt-2"
          >
            <Trash className="h-4 w-4" />
            {loading&&(previewImage === url) ? <Loading color="red-500" /> : " delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
