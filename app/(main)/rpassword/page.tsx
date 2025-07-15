"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler } from "react-hook-form";
import Loading from "@/components/loading";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import axios from "axios";

type Inputs = {
  password: string;
  confirmpassword: string;
};

const ResetPasswordComponent = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
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
  const matchedPassword = watch("password") === watch("confirmpassword");
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/rpassword", { password: data.password, email })
      .then(({ data }) => {
        if (data.reset) {
          router.push(`/signin`);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-2">
      <p>Reset password</p>
      <div className="w-full sm:w-auto">
        <div >
          <p className="text-sm">new password</p>
          <Input
            type="password"
            className="signInputs"
            {...register("password", { required: true })}
          />
        </div>
        {errors.password && (
          <span className="text-red-500 text-sm ">This field is required</span>
        )}
        <div>
          <p className="text-sm">confirm new password</p>
          <Input
            type="password"
            className={
              watch("password")
                ? matchedPassword
                  ? "correctPassword"
                  : "wrongPassword"
                : "signInputs"
            }
            {...register("confirmpassword", { required: true })}
          />
        </div>
        <Button
          variant="outline"
          className="sm:w-100 w-full bg-[var(--mygreen)] text-white mt-6"
          onClick={handleSubmit(onSubmit)}
          disabled={!allFilled || !matchedPassword || loading}
        >
          {loading ? <Loading color="white" /> : "reset"}
        </Button>
      </div>
    </div>
  );
};

export default function ResetPassword() {
  return (
    <Suspense fallback={<Loading color="gray" />}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
