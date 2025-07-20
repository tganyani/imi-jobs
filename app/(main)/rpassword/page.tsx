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
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object(
  {
  password: z.string().trim().min(6,"password must be at least 6 characters"),
  confirmpassword: z.string().trim().min(6,"confirm your password"),
}
)

type Inputs = z.infer<typeof formSchema>

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
  } = useForm<Inputs>({
    resolver:zodResolver(formSchema)
  });
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
          toast(`Password successfully reset `);
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
        <div>
          {errors.password && (
          <span className="text-red-500 text-sm ">{errors.password.message}</span>
        )}
        </div>
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
        <div>
           {errors.confirmpassword && (
          <span className="text-red-500 text-sm ">{errors.confirmpassword.message}</span>
        )}
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
