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
  phone: string;
  linkedInn: string;
  faceBook: string;
  website: string;
  telegram: string;
  whatsapp: string;
};

export default function EditContactMoadal({
  phone,
  linkedInn,
  faceBook,
  website,
  telegram,
  whatsapp,
}: Inputs) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      phone,
      linkedInn,
      website,
      telegram,
      faceBook,
      whatsapp,
    },
  });

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
      <DialogContent className="flex flex-col border-none justify-center items-center max-w-screen max-h-screen  sm:max-w-100 sm:p-4 p-2">
        <DialogHeader className="w-full">
          <DialogTitle className="text-sm text-start">Edit ?</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 w-full overflow-y-auto py-4">
          <div>
            <p className="text-sm">phone</p>
            <Input {...register("phone")} className="modalInputs text-sm" />
          </div>

          <div>
            <p className="text-sm">linked inn link</p>
            <Input {...register("linkedInn")} className="modalInputs text-sm" />
          </div>

          <div>
            <p className="text-sm">whatsapp link</p>
            <Input {...register("whatsapp")} className="modalInputs text-sm" />
          </div>
          <div>
            <p className="text-sm">telegram link</p>
            <Input {...register("telegram")} className="modalInputs text-sm" />
          </div>
          <div>
            <p className="text-sm">facebook link</p>
            <Input {...register("faceBook")} className="modalInputs text-sm" />
          </div>
          <div>
            <p className="text-sm">website link</p>
            <Input {...register("website")} className="modalInputs text-sm" />
          </div>

          <Button
            disabled={loading}
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
