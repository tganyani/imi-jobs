"use client";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useAuthStore } from "@/stores/authStore";
import "react-quill-new/dist/quill.snow.css";
import { defaultCompanyTemplate, quillModules } from "@/lib/constant";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import dynamic from "next/dynamic";
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
import { Pencil } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

type Inputs = {
  companyInfo: string;
};

export default function EditCompanyInfoMoadal({ companyInfo }: Inputs) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const {
    handleSubmit,
    watch,
    formState: { errors },
    control,
  } = useForm<Inputs>({
    defaultValues: {
      companyInfo: companyInfo ? companyInfo : defaultCompanyTemplate,
    },
  });
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && val.trim() !== ""
  );
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .patch(`/api/candidate/${userId}`, data)
      .then(({ data }) => {
        if (data.id) {
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
      <DialogContent className="flex flex-col justify-center border-none sm:p-4 p-2 max-h-screen items-center max-w-screen sm:max-w-200">
        <DialogHeader className="w-full ">
          <DialogTitle className="text-sm">Edit ?</DialogTitle>
          <VisuallyHidden>
            <DialogDescription ></DialogDescription>
          </VisuallyHidden>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full overflow-y-auto py-4 ">
          <div className="space-y-2">
            <p className="text-sm">about company</p>
            <Controller
              name="companyInfo"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <ReactQuill
                  modules={quillModules}
                  theme="snow"
                  {...field}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
          </div>
          {errors.companyInfo && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <Button
            disabled={!allFilled || loading}
            onClick={handleSubmit(onSubmit)}
            variant="outline"
            className="w-full bg-[var(--mygreen)] text-white mt-10"
          >
            {loading ? <Loading color="white" /> : " submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
