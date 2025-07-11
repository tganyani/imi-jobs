"use client"
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler} from "react-hook-form";
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

type Inputs = {
  email: string;
};


export default function ForgotPasswordMoadal() {
  const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<Inputs>();
    const values = watch();
    const allFilled = Object.values(values).every(
      (val) => val && val.trim() !== ""
    );
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
      setLoading(true);
      await axios
        .post("/api/fpassword", data)
        .then(({ data }) => {
          if (data.codeSend) {
            router.push(`/verify?email=${encodeURIComponent(data?.email)}&fpassword=${encodeURIComponent(true)}`)
          }
        })
        .catch((err) => console.error(err));
      setLoading(false);
    };
  return (
    <Dialog>
      <DialogTrigger className="text-[var(--mygreen)] mt-2 text-sm">
        forgot password?
      </DialogTrigger>
      <DialogContent className="h-70 flex flex-col justify-center items-center">
        <DialogHeader className="bg-red">
          <DialogTitle>You forgot password?</DialogTitle>
          <DialogDescription>
            Enter your email in the input below
          </DialogDescription>
        </DialogHeader>
        <div>
          <div>
            <p>email</p>
            <Input type="email" {...register("email", { required: true })} className="signInputs" />
          </div>
          {errors.email && (
          <span className="text-red-500 text-sm ">This field is required</span>
        )}
          <Button
           disabled={!allFilled || loading}
          onClick={handleSubmit(onSubmit)}
            variant="outline"
            className="w-100 bg-[var(--mygreen)] text-white mt-10"
          >
           
            {loading ? <Loading color="white" /> : " submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
