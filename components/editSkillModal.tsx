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
import type { Candidate, Skill } from "@/lib/types";

type Inputs = {
  title: string;
  level: string;
};

export default function EditSkillMoadal({ skills }: { skills: Skill[] }) {
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
          skills: [...currentData.skills,{...data,id:String(new Date())}],
        };
      },
      false // false means: don't revalidate after mutation
    );
    await axios
      .post(`/api/candidate/skill`, { ...data, userId })
      .then(({ data }) => {
        if (data.created) {
          mutate(`/api/candidate/${userId}`);
          //   setOpen(false);
          reset({title:"",level:"junior"})
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
          skills: currentData.skills.filter((skill) => skill.id !== id),
        };
      },
      false // false means: don't revalidate after mutation
    );
    await axios
      .delete(`/api/candidate/skill/${id}`)
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
      <DialogContent className="flex flex-col border-0  justify-center items-center max-h-screen max-w-screen sm:max-w-150 p-2 sm:p-4">
        <DialogHeader className="w-full ">
          <DialogTitle className="text-sm">Edit ?</DialogTitle>
          <DialogDescription>Add or delete skill</DialogDescription>
        </DialogHeader>
        <div className="w-full  overflow-y-auto">
          <div className="min-h-30 border-1 flex flex-row flex-wrap gap-2 justify-between  border-stone-400 p-2 rounded-xl">
            {skills.map((skill: Skill) => (
              <div
                key={skill.id}
                className="flex  py-1 w-fit h-fit flex-row flex-nowrap border-1 gap-x-2 border-stone-400 p-2 rounded-xl"
              >
                <div className="">
                  <p className=" text-sm ">{skill.title}</p>
                  <p className="text-gray-500 text-sm ">{skill.level}</p>
                </div>
                <div><CircleX
                  onClick={() => handleDelete(skill.id)}
                  className="h-4 w-4 text-[var(--mygreen)] hover:text-red-500"
                /></div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm">skill title</p>
            <Input {...register("title", { required: true })} className="focus-visible:ring-1"/>
          </div>
          {errors.title && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">experience level</p>
            <Controller
              name="level"
              control={control}
              defaultValue="junior"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50">
                    <SelectItem value="senior">senior</SelectItem>
                    <SelectItem value="intermediate">intermediate</SelectItem>
                    <SelectItem value="junior">junior</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button
            onClick={allFilled?handleSubmit(onSubmit):()=>setOpen(false)}
            variant="outline"
            className="w-full bg-[var(--mygreen)] text-white mt-10 mb-20"
          >
            {allFilled ?  " add":"close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
