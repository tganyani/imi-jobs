"use client";
import { useState } from "react";
import { useForm, SubmitHandler , Controller} from "react-hook-form";
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
import Loading from "./loading";
import { mutate } from "swr";
import { Pencil, Plus } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { DatePicker } from "./datePicker";

type Inputs = {
  position: string;
  startAt: Date | undefined;
  endAt: Date | undefined;
  location: string;
  roles:string,
  company:string
};

export default function EditEmploymentMoadal({
  position,
  location,
  startAt,
  endAt,
  editMode,
  id,
  roles,
  company
}: Inputs & { editMode: boolean ,id:string}) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control
  } = useForm<Inputs>({
    defaultValues: {
      location,
      company,
      startAt,
      endAt,
      roles,
      position
    },
  });
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && String(val).trim() !== ""
  );
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post(`/api/candidate/employhist`, {...data,userId})
      .then(({ data }) => {
        if (data.created) {
          mutate(`/api/candidate/${userId}`);
          setOpen(false);
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  const handleEdit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    console.log(data)
    await axios
      .patch(`/api/candidate/employhist/${id}`, data)
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
        {editMode ? (
          <Pencil className="h-3 w-3 text-[var(--mygreen)]" />
        ) : (
          <Plus className="h-3 w-3 text-[var(--mygreen)]" />
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col border-0 justify-center items-center  max-h-screen max-w-screen sm:max-w-150 p-2 sm:p-4">
        <DialogHeader className="w-full">
          <DialogTitle className="text-sm text-start">{editMode?"Edit":"Create"} ?</DialogTitle>
          <DialogDescription>
           
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2 w-full overflow-y-auto">
          <div>
            <p className="text-sm">Company name</p>
            <Input
              {...register("company", { required: true })}
              className="modalInputs"
            />
          </div>
          <div>
            <p className="text-sm">Location</p>
            <Input
              {...register("location", { required: true })}
              className="modalInputs"
            />
          </div>
          <div>
            <p className="text-sm">Position</p>
            <Input
              {...register("position", { required: true })}
              className="modalInputs"
            />
          </div>
          <div>
            <p className="text-sm">Employment start date</p>
            <Controller
        name="startAt"
        control={control}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
          </div>
          <div>
            <p className="text-sm">Employment end date</p>
            <Controller
        name="endAt"
        control={control}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
          </div>
          <div>
            <p className="text-sm">Roles /responsibilities</p>
            <Textarea
              {...register("roles", { required: true })}
             className="modalInputs"
            />
          </div>
          {errors.roles && (
            <span className="text-red-500 text-sm ">
              This field is required
            </span>
          )}
          <Button
            disabled={!allFilled || loading}
            onClick={editMode?handleSubmit(handleEdit):handleSubmit(onSubmit)}
            variant="outline"
            className="w-full bg-[var(--mygreen)] text-white mt-10"
          >
            {loading ? <Loading color="white" /> : editMode?"edit":"submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}