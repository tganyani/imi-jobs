"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import ForgotPasswordMoadal from "@/components/fpasswordmodal";
import axios from "axios";
import Loading from "@/components/loading";

type Inputs = {
  password: string;
  email: string;
};

import { socket } from "@/lib/socket";

export default function Login() {
  
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
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

  // Make sure zustand store is hydrated before accessing (Next.js SSR safe)
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/signin", data)
      .then(({ data }) => {
        if (data.logged) {
          login(data?.email, data?.id,data?.role);
          socket.emit("online",{userId:data?.id})
          router.push(`/`);
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  if (!hasHydrated) return null;
  return (
    <div className="flex flex-col justify-center items-center min-h-screen ">
      <p className="">
        Log in to <span className="text-[var(--mygreen)] ">Imisebenzi</span>
      </p>
      <div className="border-red-500 w-full sm:w-auto px-2">
        <div>
          <p className="text-sm">email</p>
          <Input
            type="email"
            {...register("email", { required: true })}
            className="signInputs text-sm"
          />
        </div>
        {errors.email && (
          <span className="text-red-500 text-sm ">This field is required</span>
        )}
        <div>
          <p className="text-sm">password</p>
          <Input
            type="password"
            {...register("password", { required: true })}
            className="signInputs text-sm"
          />
        </div>
        <div className="flex flex-row justify-end items-center">
          <ForgotPasswordMoadal />
        </div>
        <Button
          disabled={!allFilled || loading}
          onClick={handleSubmit(onSubmit)}
          variant="outline"
          className="sm:w-100  w-full bg-[var(--mygreen)] text-white mt-6"
        >
          {loading ? <Loading color="white" /> : "login"}
        </Button>
        <div className="flex flex-row justify-center  gap-x-6 items-center mt-6">
          <p className="text-sm">Don`t have account?</p>{" "}
          <Button onClick={()=>router.push("/signup")}variant="link" className="text-[var(--mygreen)]">
            register
          </Button>
        </div>
      </div>
    </div>
  );
}
