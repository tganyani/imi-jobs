"use client";
import { useState } from "react";
import { Eye, EyeOff, FileText } from "lucide-react";

import { Button } from "./ui/button";

import PdfViewer from "./pdfViewer";

export default function ViewCV({ url }: { url: string }) {
  const [review, setReview] = useState<boolean>(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-row flex-nowrap justify-between">
        <p>CV</p>
      </div>
      <div className="flex flex-row flex-nowrap justify-between">
        <div className="flex flex-row gap-x-2 items-center p-2 border-1 border-gray-300 rounded-[20px] w-fit">
          <FileText className="text-red-700 h-4 w-4" />
          <p>{url.split("_")[1]}</p>
        </div>
        {!review ? (
          <Button onClick={() => setReview(!review)}>
            <Eye className="h-6 w-6 text-stone-500 hover:text-stone-400" />
            <p className="hidden sm:block">preview</p>
          </Button>
        ) : (
          <Button onClick={() => setReview(!review)}>
            <EyeOff className="h-6 w-6 text-stone-500 hover:text-stone-400" />
            <p className="hidden sm:block">close</p>
          </Button>
        )}
      </div>
      {review && (
        <div className="w-screen">
          <PdfViewer url={url} />
        </div>
      )}
    </div>
  );
}
