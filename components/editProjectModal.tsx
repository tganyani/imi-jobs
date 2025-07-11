"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { Pencil, Plus ,Upload} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { CircleX } from "lucide-react";
import { ProjectImage } from "@/lib/types";

type Inputs = {
  title: string;
  description: string;
};
export default function EditProjectMoadal({
  title,
  description,
  editMode,
  id,
  previousImages,
}: Inputs & { editMode: boolean; id: string; previousImages: ProjectImage[] }) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [deletedIds, setDeletedIds] = useState<{ publicId: string }[]>([]);
  const [previewImages, setPreviewImages] =
    useState<ProjectImage[]>(previousImages);


useEffect(()=>{
    setPreviewImages(previousImages)
    setDeletedIds([])
    setImages([])
},[open])
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prevImages) => [...prevImages, ...acceptedFiles]);
    setPreviewImages((prevImages) => [
      ...prevImages,
      ...acceptedFiles.map((file) => ({
        publicId: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
      })),
    ]);
  }, []);
  const removeFile = (url: string) => {
    setImages((prev) =>
      prev.filter((file) => URL.createObjectURL(file) !== url)
    );
    setPreviewImages((prev) => prev.filter((file) => file.url !== url));
    setDeletedIds((prev) => [
      ...prev,
      ...previousImages.filter((file: ProjectImage) => file.url === url).map((file:ProjectImage)=>({publicId:file.publicId})),
    ]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      title,
      description,
    },
  });
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && String(val).trim() !== ""
  );

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);

    const formData = new FormData();
    images.forEach((file) => formData.append("files", file));
    formData.append("description", data.description);
    formData.append("title", data.title);
    formData.append("userId", userId as string);

    await axios
      .post("/api/project", formData)
      .then(({ data }) => {
        if (data.created) {
          mutate(`/api/candidate/${userId}`);
          setOpen(false);
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  const handleEdit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    console.log(data);
    const formData = new FormData();
    images.forEach((file) => formData.append("files", file));
    formData.append("description", data.description);
    formData.append("title", data.title);
    formData.append("deletedIds",JSON.stringify(deletedIds))

    await axios
      .patch(`/api/project/${id}`, formData)
      .then(({ data }) => {
        if (data.updated) {
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
        {editMode ? (
          <Pencil className="h-3 w-3 text-[var(--mygreen)]" />
        ) : (
          <Plus className="h-3 w-3 text-[var(--mygreen)]" />
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center items-center border-0 max-w-screen sm:max-w-200 p-2 sm:p-4 max-h-screen">
        <DialogHeader className="w-full">
          <DialogTitle className="text-sm text-start">{editMode ? "Edit" : "Create"} ?</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 w-full overflow-y-auto py-4">
          <div>
            <p className="text-sm">Title</p>
            <Input
              {...register("title", { required: true })}
              className="modalInputs"
            />
          </div>
          <div>
            <p className="text-sm">Description</p>
            <Textarea
              {...register("description", { required: true })}
              className="modalInputs"
            />
          </div>
          {errors.description && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          {previewImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm">Preview</p>
              <div className="flex flex-row gap-2 flex-wrap">
                {previewImages?.map((image: ProjectImage) => (
                  <div key={image.publicId} className="relative w-20 h-20">
                    <CircleX
                        onClick={() => removeFile(image.url)}
                      className="h-4 w-4 text-[var(--mygreen)] hover:text-red-500 absolute top-0 z-2 right-0"
                    />
                    <Image
                      src={image.url}
                      alt={`Preview ${id}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded shadow"
                      unoptimized // 🔥 Required for object URLs
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div {...getRootProps()} className="">
            <input {...getInputProps()} />
            <div className="flex flex-col gap-y-2 border-1 items-center mt-4 border-stone-400 p-2 rounded-xl">
                {isDragActive ? (
              <p className="text-sm">Drop the files here ...</p>
            ) : (
              <p className="text-sm">Drag drop some files here, or click to select files</p>
            )}
                <Upload className="h-4 w-4 text-gray-500"/>
            </div>
            
          </div>
          <Button
            disabled={!allFilled || loading}
            onClick={
              editMode ? handleSubmit(handleEdit) : handleSubmit(onSubmit)
            }
            variant="outline"
            className="w-full bg-[var(--mygreen)] text-white mt-10"
          >
            {loading ? <Loading color="white" /> : editMode ? "edit" : "submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
