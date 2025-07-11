"use client";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Loading from "./loading";
import { mutate } from "swr";
import { Pencil } from "lucide-react";

type Inputs = {
  name: string;
  position: string;
  city: string;
  country: string;
};

export default function EditNameMoadal({
  name,
  position,
  city,
  country,
}: Inputs) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name,
      position,
      city,
      country,
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
        <Pencil className="h-3 w-3 text-[var(--mygreen)]"/>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center border-0 max-w-screen sm:max-w-100 sm:p-4 p-2 items-center max-h-screen">
        <DialogHeader className="w-full">
          <DialogTitle className="text-sm text-start ">Edit ?</DialogTitle>
          <DialogDescription>
           
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 w-full py-2 overflow-y-auto">
          <div>
            <p className="text-sm">name</p>
            <Input
              {...register("name", { required: true })}
               className="modalInputs"
            />
          </div>
          {errors.name && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">position</p>
            <Input
              {...register("position", { required: true })}
               className="modalInputs"
            />
          </div>
          {errors.position && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">city</p>
            <Input
              {...register("city", { required: true })}
              className="modalInputs"
            />
          </div>
          {errors.city && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">country</p>
            <Input
              {...register("country", { required: true })}
              className="modalInputs"
            />
          </div>
          {errors.country && (
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
