"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler} from "react-hook-form";
import { useResendStore } from "@/stores/resendCodeStore";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().trim().min(1,"email is required").email("invalid email address")
})

type Inputs = z.infer<typeof formSchema>


export default function ForgotPasswordMoadal() {
  const [loading, setLoading] = useState<boolean>(false);
  const {setTriggerOnMount} = useResendStore()
  const [logError, setLogError] = useState<string>("")
    const router = useRouter();
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<Inputs>({
      resolver:zodResolver(formSchema)
    });
    const values = watch();
    const allFilled = Object.values(values).every(
      (val) => val && val.trim() !== ""
    );
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
      setLoading(true);
      await axios
        .post("/api/fpassword", data)
        .then(({ data }) => {
          setLogError(data?.error)
          if (data.codeSend) {
            router.push(`/verify?email=${encodeURIComponent(data?.email)}&fpassword=${encodeURIComponent(true)}`)
            setTriggerOnMount(true)
          }
        })
        .catch((err) => console.error(err));
      setLoading(false);
    };
    useEffect(()=>{
      setLogError("")
    },[values.email])
  return (
    <Dialog>
      <DialogTrigger className="text-[var(--mygreen)] mt-2 text-sm font-bold">
        forgot password?
      </DialogTrigger>
      <DialogContent className="h-70 flex flex-col justify-center items-center border-0 sm:px-x-4 px-2">
        <DialogHeader className="bg-red">
          <DialogTitle className="text-sm">You forgot password?</DialogTitle>
          <DialogDescription className="text-sm">
            Enter your email in the input below
          </DialogDescription>
        </DialogHeader>
        <div className="sm:w-auto w-full ">
          <p className="text-red-500 text-sm ">{logError}</p>
          <div className="">
            <p className="text-sm">email</p>
            <Input type="email" {...register("email", { required: true })} className="signInputs text-sm" />
          </div>
          <div>
            {errors.email && (
          <span className="text-red-500 text-sm ">{errors.email.message}</span>
        )}
          </div>
          <Button
           disabled={!allFilled || loading}
          onClick={handleSubmit(onSubmit)}
            variant="outline"
            className="sm:w-100 w-full bg-[var(--mygreen)] text-white mt-10"
          >
           
            {loading ? <Loading color="white" /> : " submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
