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
  companyName: string;
  address: string;
  city: string;
  country: string;
};

export default function EditCompanyMainInfoMoadal({
  name,
  companyName,
  city,
  country,
  address,
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
      companyName,
      city,
      country,
      address,
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
      <DialogContent className="flex flex-col justify-center items-center max-h-screen border-none sm:p-4 p-2 max-w-screen sm:max-w-100">
        <DialogHeader className="w-full">
          <DialogTitle className="text-sm">Edit ?</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 w-full overflow-x-auto">
          <div>
            <p className="text-sm">name</p>
            <Input
              {...register("name", { required: true })}
              className="modalInputs text-sm"
            />
          </div>
          {errors.name && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">company name</p>
            <Input
              {...register("companyName", { required: true })}
              className="modalInputs text-sm"
            />
          </div>
          {errors.companyName && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div>
            <p className="text-sm">physical address</p>
            <Input
              {...register("address", { required: true })}
              className="modalInputs text-sm"
            />
          </div>
          {errors.address && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div className="text-sm">
            <p>city</p>
            <Input
              {...register("city", { required: true })}
              className="modalInputs text-sm"
            />
          </div>
          {errors.city && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <div className="text-sm">
            <p>country</p>
            <Input
              {...register("country", { required: true })}
              className="modalInputs text-sm"
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
