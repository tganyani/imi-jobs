"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Loading from "@/components/loading";
import axios from "axios";

type Inputs = {
  code: string;
};

export default function VerifyPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const fpasswsord = searchParams.get("fpassword");
  const [loading, setLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      code: "",
    },
  });
  const code = watch("code");
  const allFilled = code.length === 6;
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/verify", { code: data.code, email })
      .then(({ data }) => {
        if (data.verified) {
          if (fpasswsord) {
            router.push(`/rpassword?email=${encodeURIComponent(data?.email)}`);
          } else {
            router.push("/signin");
          }
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen ">
      <p>Verify your email</p>
      <p className="text-sm">We have send the verification code to</p>
      <p className="text-sm text-gray-400">{email}</p>
      <div>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              value={field.value}
              onChange={field.onChange}
            >
              <InputOTPGroup className="flex w-100 flex-row justify-between mt-6">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="border border-gray-300 rounded-md"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {errors.code && (
          <span className="text-red-500 text-sm ">This field is required</span>
        )}
        <Button
          variant="outline"
          className="w-100 bg-[var(--mygreen)] text-white mt-6"
          onClick={handleSubmit(onSubmit)}
          disabled={!allFilled || loading}
        >
          {loading ? <Loading color="white" /> : "verify"}
        </Button>
      </div>
    </div>
  );
}
