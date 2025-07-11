"use client";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
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
import { mutate } from "swr";
import { Pencil, CircleX } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Candidate, Language,} from "@/lib/types";

type Inputs = {
  level: string;
  name: string;
};

export default function EditLanguageMoadal({ languages }: { languages: Language[] }) {
  const { userId } = useAuthStore();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && val.trim() !== ""
  );
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    mutate<Candidate>(
      `/api/candidate/${userId}`,
      (currentData) => {
        if (!currentData) return undefined; // important safety

        return {
          ...currentData,
          languages: [...currentData.languages,{...data,id:String(new Date())}],
        };
      },
      false // false means: don't revalidate after mutation
    );
    await axios
      .post(`/api/candidate/language`, { ...data, userId })
      .then(({ data }) => {
        if (data.created) {
          mutate(`/api/candidate/${userId}`);
          //   setOpen(false);
          reset({name:"",level:"conversational"})
        }
      })
      .catch((err) => console.error(err));
  };
  const handleDelete = async (id: string) => {
    mutate<Candidate>(
      `/api/candidate/${userId}`,
      (currentData) => {
        if (!currentData) return undefined; // important safety

        return {
          ...currentData,
          languages: currentData.languages.filter((language) => language.id !== id),
        };
      },
      false // false means: don't revalidate after mutation
    );
    await axios
      .delete(`/api/candidate/language/${id}`)
      .then(({ data }) => {
        if (data.id) {
          mutate(`/api/candidate/${userId}`);
          //   setOpen(false);
        }
      })
      .catch((err) => console.error(err));
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex  flex-row items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--mygreen)]">
        <Pencil className="h-3 w-3 text-[var(--mygreen)]" />
      </DialogTrigger>
      <DialogContent className="flex flex-col border-0 justify-center items-center max-h-screen max-w-screen sm:max-w-150 p-2 sm:p-4">
        <DialogHeader className="w-full ">
          <DialogTitle className="text-sm text-start">Edit ?</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full  overflow-y-auto space-y-2">
          <div className="min-h-30 border-1 flex flex-row flex-wrap gap-2 justify-between  border-stone-400 p-2 rounded-xl">
            {languages.map((language:Language) => (
              <div
                key={language.id}
                className="flex  py-1 w-fit h-fit flex-row flex-nowrap border-1 gap-x-2 border-stone-400 p-1 sm:p-2 rounded-xl"
              >
                <div className="">
                  <p className=" text-sm ">{language.name}</p>
                  <p className="text-gray-500 text-sm ">{language.level}</p>
                </div>
                <div><CircleX
                  onClick={() => handleDelete(language.id)}
                  className="h-4 w-4 text-[var(--mygreen)] hover:text-red-500"
                /></div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm">language</p>
            <Input className="text-sm focus-visible:ring-1" {...register("name", { required: true })} />
          </div>
          {errors.name && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">level</p>
            <Controller
              name="level"
              control={control}
              defaultValue="conversational"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50">
                    <SelectItem value="conversational">conversational</SelectItem>
                    <SelectItem value="intermediate">intermediate</SelectItem>
                    <SelectItem value="fluent">fluent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button
            onClick={allFilled?handleSubmit(onSubmit):()=>setOpen(false)}
            variant="outline"
            className="w-full bg-[var(--mygreen)] text-white mt-6"
          >
            {allFilled ?  " add":"close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}