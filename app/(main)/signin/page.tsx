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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  password: z.string().trim().min(1, "password is required"),
  email: z.string().trim().min(1, "email is required"),
});

type Inputs = z.infer<typeof formSchema>;

import GoogleButton from "@/components/googleBtn";
import { socket } from "@/lib/socket";

export default function Login() {
  const [loading, setLoading] = useState<boolean>(false);
  const [logError, setLogError] = useState<string>("");
  const router = useRouter();
  const { login } = useAuthStore();

  const [hasHydrated, setHasHydrated] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(formSchema),
  });
  const values = watch();
  const allFilled = Object.values(values).every(
    (val) => val && val.trim() !== ""
  );

  // reset the log error
  useEffect(() => {
    setLogError("");
  }, [values.password, values.email]);
  // Make sure zustand store is hydrated before accessing (Next.js SSR safe)
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/signin", data)
      .then(({ data }) => {
        setLogError(data?.error);
        if (data.logged) {
          login(data?.email, data?.id, data?.role, data?.name);
          socket?.emit("online", { userId: data?.id });
          router.push(`/`);
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  if (!hasHydrated) return null;
  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-2 ">
      <p className="">
        Log in to <span className="text-[var(--mygreen)] ">Imisebenzi</span>
      </p>
      <div className="border-red-500 w-full sm:w-auto px-2">
        <p className="text-sm text-red-500">{logError}</p>
        <div>
          <p className="text-sm">email</p>
          <Input
            type="email"
            {...register("email", { required: true })}
            className="signInputs text-sm"
          />
        </div>
        {errors.email && (
          <span className="text-red-500 text-sm ">{errors.email.message}</span>
        )}
        <div>
          <p className="text-sm">password</p>
          <Input
            type="password"
            {...register("password", { required: true })}
            className="signInputs text-sm"
          />
        </div>
        {errors.password && (
          <span className="text-red-500 text-sm ">
            {errors.password.message}
          </span>
        )}
        <div className="flex flex-row justify-end items-center">
          <ForgotPasswordMoadal />
        </div>
        <Button
          disabled={!allFilled || loading}
          onClick={handleSubmit(onSubmit)}
          variant="outline"
          className="sm:w-100  w-full bg-[var(--mygreen)] text-white mt-6 font-bold"
        >
          {loading ? <Loading color="white" /> : "login"}
        </Button>
        <div className="flex flex-row justify-center  gap-x-6 items-center mt-6">
          <p className="text-sm font-bold">Don`t have account?</p>{" "}
          <Button
            onClick={() => router.push("/signup")}
            variant="link"
            className="text-[var(--mygreen)] font-bold"
          >
            register
          </Button>
        </div>
      </div>
      <GoogleButton />
    </div>
  );
}
