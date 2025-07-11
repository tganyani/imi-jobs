"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { defaultTemplate } from "@/lib/constant";
import axios from "axios";
import Loading from "@/components/loading";
import { useAuthStore } from "@/stores/authStore";
import type { JobInputs } from "@/lib/types";
import { toast } from "sonner";
import { jobFields } from "@/lib/constant";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

export default function PostJob() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false);
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
      description: defaultTemplate,
    },
  });
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && val.trim() !== ""
  );

  const onSubmit: SubmitHandler<JobInputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/vaccancy", { ...data, userId })
      .then(({ data }) => {
        if (data.created) {
          mutate(`/api/vaccancy/user/${userId}`)
          toast("Job successfully posted", {
                description: "The job has been published you  can continue to view it ",
                action: (
                  <Button
                  size="sm"
                    onClick={() => router.push('/vaccancy/posted')}
                    className="px-3 rounded-md bg-[var(--mygreen)] text-white text-sm hover:bg-green-600 transition"
                  >
                    view job
                  </Button>
                ),
              });
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  return (
    <div className="flex flex-col  justify-center items-center min-h-screen ">
      <p className=" my-8 [@media(max-width:480px)]:text-sm ">Post new vaccancy</p>
      <div className="sm:w-150 w-98/100 space-y-4 ">
        <div className="vaccancyInputdiv2 gap-y-4">
          <div>
            <p className="text-sm">company name</p>
            <Input
              {...register("companyName", { required: true })}
              className="vaccancyInput1 "
            />
          </div>
          <div>
            <p className="text-sm">country</p>
            <Input
              {...register("country", { required: true })}
              className="vaccancyInput1"
            />
          </div>
        </div>
        {errors.country && (
          <span className="text-red-500 text-sm ">This field is required</span>
        )}
        <div>
          <p className="text-sm">city</p>
          <Input
            {...register("city", { required: true })}
            className="border-1 border-stone-400 focus-visible:ring-1"
          />
        </div>
        <div>
          <p className="text-sm">vaccancy title</p>
          <Input
            {...register("title", { required: true })}
            className="border-1 border-stone-400 focus-visible:ring-1"
          />
        </div>
        <div>
          <p className="text-sm">description</p>
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
            <p className="text-sm">salary</p>
            <Input
              {...register("salary", { required: true })}
              className="vaccancyInput1"
            />
          </div>
          <div>
            <p className="text-sm">work condition</p>
            <Controller
              name="type"
              control={control}
              defaultValue="office"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} >
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
            <p className="text-sm">sector</p>
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
                    {
                      jobFields.map(field=>(
                        <SelectItem key={field.id} value={field.title}>{field.title}</SelectItem>
                      ))
                    }
                    
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Button
              variant="outline"
              className="w-70 bg-[var(--mygreen)] text-white mt-6"
              onClick={handleSubmit(onSubmit)}
              disabled={!allFilled || loading}
            >
              {loading ? <Loading color="white" /> : "submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
