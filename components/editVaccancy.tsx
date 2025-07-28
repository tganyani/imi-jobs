"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import "react-quill-new/dist/quill.snow.css";
import { quillModules } from "@/lib/constant";
import { mutate } from "swr";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import axios from "axios";
import Loading from "@/components/loading";
import { useAuthStore } from "@/stores/authStore";
import type { JobInputs } from "@/lib/types";
import { toast } from "sonner";
import { jobFields } from "@/lib/constant";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Pencil } from "lucide-react";
import { socket } from "@/lib/socket";
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});
export default function EditVaccancy({
  job,
  byId,
}: {
  job: JobInputs & { id: string };
  byId: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { userId } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    control,
    // reset,
    formState: { errors },
  } = useForm<JobInputs>({
    defaultValues: {
      description: job.description,
      companyName: job.companyName,
      city: job.city,
      country: job.country,
      title: job.title,
      salary: job.salary,
      type: job.type,
      sector: job.sector,
    },
  });
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && val.trim() !== ""
  );

  const onSubmit: SubmitHandler<JobInputs> = async (data) => {
    setLoading(true);
    await axios
      .patch(`/api/vaccancy/${job.id}`, { ...data, userId })
      .then(({ data }) => {
        if (data.updated) {
          socket.emit("newJob")
          if (byId) {
            mutate(`/api/vaccancy/${job.id}`);
          } else {
            mutate(`/api/vaccancy/user/${userId}`);
          }
          setOpen(false);
          toast("Job successfully updated", {
            description: "Now you can recieve new applications from clients ",
            action: (
              <Button
                size="sm"
                onClick={() => console.log("closed")}
                className="px-3 rounded-md bg-[var(--mygreen)] text-white text-sm hover:bg-green-600 transition"
              >
                close
              </Button>
            ),
          });
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {byId ? (
        <SheetTrigger className="flex items-center flex-nowrap p-1 hover:border-green-500 gap-x-4 justify-center w-60 [@media(max-width:480px)]:w-full rounded-full border-2 border-[var(--mygreen)]">
          <Pencil className="h-4 w-4 text-[var(--mygreen)]" />
          <p className="text-sm text-[var(--mygreen)]">edit vaccancy</p>
        </SheetTrigger>
      ) : (
        <SheetTrigger className="flex  flex-row items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--mygreen)]">
          <Pencil className="h-3 w-3 text-[var(--mygreen)]" />
        </SheetTrigger>
      )}
      <SheetContent className="border-none sm:max-w-screen md:w-[90%]  w-full max-h-screen ">
        <SheetHeader className="">
          <SheetTitle className="text-center text-sm ">
            Are you sure! you want to edit?
          </SheetTitle>
          <VisuallyHidden>
            <SheetDescription></SheetDescription>
          </VisuallyHidden>
        </SheetHeader>
        <div className="flex flex-col  justify-center items-center pt-120 sm:pt-70  pb-4 overflow-y-auto ">
          <div className="sm:w-150 w-98/100 space-y-4 ">
            <div className="vaccancyInputdiv2 gap-y-4">
              <div>
                <p className="vaccancyLabel">company name</p>
                <Input
                  {...register("companyName", { required: true })}
                  className="vaccancyInput1"
                />
              </div>
              <div>
                <p className="vaccancyLabel">country</p>
                <Input
                  {...register("country", { required: true })}
                  className="vaccancyInput1"
                />
              </div>
            </div>
            {errors.country && (
              <span className="text-red-500 text-sm ">
                This field is required
              </span>
            )}
            <div>
              <p className="vaccancyLabel">city</p>
              <Input
                {...register("city", { required: true })}
                className="border-1 border-stone-400 focus-visible:ring-1 text-sm"
              />
            </div>
            <div>
              <p className="vaccancyLabel">vaccancy title</p>
              <Input
                {...register("title", { required: true })}
                className="border-1 border-stone-400 focus-visible:ring-1 text-sm"
              />
            </div>
            <div>
              <p className="vaccancyLabel">description</p>
              <Controller
                name="description"
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
            <div className="vaccancyInputdiv2 gap-y-4">
              <div>
                <p className="vaccancyLabel">salary</p>
                <Input
                  {...register("salary", { required: true })}
                  className="vaccancyInput1"
                />
              </div>
              <div>
                <p className="vaccancyLabel">work condition</p>
                <Controller
                  name="type"
                  control={control}
                  defaultValue="office"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="vaccancyInput1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-stone-300 border-1 ">
                        <SelectItem value="office">in office</SelectItem>
                        <SelectItem value="remote">remote</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="vaccancyInputdiv2">
              <div>
                <p className="vaccancyLabel">sector</p>
                <Controller
                  name="sector"
                  control={control}
                  defaultValue="general"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="vaccancyInput1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-stone-300 border-1 ">
                        {jobFields.map((field) => (
                          <SelectItem key={field.id} value={field.title}>
                            {field.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-70 bg-[var(--mygreen)] text-white mt-6 [@media(max-width:480px)]:w-full"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!allFilled || loading}
                >
                  {loading ? <Loading color="white" /> : "update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
