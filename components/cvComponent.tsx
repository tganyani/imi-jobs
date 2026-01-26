"use client";

import {
  CircleX,
  CloudUpload,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Upload,
} from "lucide-react";

import { Button } from "./ui/button";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import Loading from "./loading";
import PdfViewer from "./pdfViewer";
import { mutate } from "swr";

export default function CVComponent({ url }: { url: string }) {
  const { userId } = useAuthStore() as { userId: string };
  const [file, setFile] = useState<File | null>();
  const [update, setUpdate] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      // "application/msword": [], // .doc
      // "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      // [], // .docx
    },
    multiple: false,
  });
  const removeFile = () => {
    setFile(null);
  };
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file as File);
    formData.append("userId", userId);
    setLoading(true);
    await axios
      .post("/api/cv", formData)
      .then(({ data }) => {
        if (data.success) {
          setUpdate(false);
          mutate(`/api/candidate/${userId}`);
          removeFile()
        }
      })
      .catch((err) => console.log(err));

    setLoading(false);
    
  };
  return (
    <div className="space-y-4">
      {!update && (
        <>
          <div className="flex flex-row flex-nowrap justify-between">
            <p>CV</p>
            <div
              onClick={() => setUpdate(true)}
              className="flex flex-row items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--mygreen)]"
            >
              <Pencil className="h-3 w-3 text-[var(--mygreen)]" />
            </div>
          </div>
          <div className="flex flex-row flex-nowrap justify-between">
            <div className="flex flex-row gap-x-2 items-center p-2 border-1 border-gray-300 rounded-[20px] w-fit">
              <FileText className="text-red-700 h-4 w-4" />
              <p>{url.split("_")[1]}</p>
            </div>
            {
              review?<Button onClick={()=>setReview(!review)}>
              <EyeOff className="h-6 w-6 text-stone-500 hover:text-stone-400" />
              <p className="hidden sm:block">close</p>
            </Button>:<Button onClick={()=>setReview(!review)}>
              <Eye className="h-6 w-6 text-stone-500 hover:text-stone-400" />
              <p className="hidden sm:block">preview</p>
            </Button>
            }
            
            
          </div>
          {
            review&&<div className="w-screen">
            <PdfViewer url={url} />
          </div>
          }
        </>
      )}
      {update && (
        <div className="space-y-2  relative border-1 border-gray-300 rounded-[20px] w-full p-2">
          <CircleX
            onClick={() => setUpdate(false)}
            className="h-6 w-6 text-[var(--mygreen)] absolute top-1 right-1 hover:text-green-500"
          />
          <div className="flex flex-col justify-end gap-y-4 min-h-[100px]  mt-8">
            {file && (
              <div className="relative w-fit border-1 border-gray-300 rounded-[20px]">
                <CircleX
                  onClick={() => removeFile()}
                  className="h-4 w-4 text-[var(--mygreen)] hover:text-red-500 absolute top-1 z-2 right-1"
                />
                <div className="flex flex-row gap-x-2 items-center p-4">
                  <FileText className="text-red-700 h-4 w-4" />
                  <p>{file.name}</p>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center    ">
              {file ? (
                <Button
                  onClick={handleUpload}
                  size="sm"
                  className="text-white bg-[var(--mygreen)]"
                >
                  {loading ? (
                    <Loading color="white" />
                  ) : (
                    <>
                      <CloudUpload className=" h-4 w-4" />
                      <p>upload</p>
                    </>
                  )}
                </Button>
              ) : (
                <div
                  {...getRootProps()}
                  className="w-fit bg-stone-100 py-1 px-3 rounded-full shadow-sm"
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-row-nowrap items-center gap-x-2 ">
                    <Upload className="text-stone-300 h-4 w-4" />
                    <p className="text-stone-400 ">choose file *pdf</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
