'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Loading from "@/components/loading";

type Inputs = {
  password: string;
  confirmpassword: string;
  name: string;
  email: string;
  role: string;
};

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    control,
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
      .post("/api/signup", data)
      .then(({ data }) => {
        if (data.created) {
          router.push(`/verify?email=${encodeURIComponent(data?.email)}`)
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen ">
      <p>
        Register to <span className="text-[var(--mygreen)] ">Imisebenzi</span>
      </p>
      <div className="sm:w-auto w-full px-2">
        <div>
          <p className="text-sm">name</p>
          <Input
            type="text"
            {...register("name", { required: true })}
            className="signInputs text-sm"
          />
        </div>
        {errors.name && (
          <span className="text-red-500 text-sm ">This field is required</span>
        )}
        <div>
          <p className="text-sm">email</p>
          <Input
            type="email"
            {...register("email", { required: true })}
            className="signInputs text-sm"
          />
        </div>
        <div className="">
          <p className="text-sm">account type</p>
          <Controller
            name="role"
            control={control}
            defaultValue="candidate"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className=" sm:w-100 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
                  <SelectItem value="candidate">candidate</SelectItem>
                  <SelectItem value="recruiter">recruiter</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <p className="text-sm">password</p>
          <Input
            type="password"
            {...register("password", { required: true })}
            className="signInputs"
          />
        </div>
        <div>
          <p className="text-sm">confirm password</p>
          <Input
            type="password"
            {...register("confirmpassword", { required: true })}
            className={
              watch("password")
                ? matchedPassword
                  ? "correctPassword"
                  : "wrongPassword"
                : "signInputs"
            }
          />
        </div>
        <Button
          disabled={!allFilled || !matchedPassword || loading}
          onClick={handleSubmit(onSubmit)}
          variant="outline"
          className="sm:w-100 w-full bg-[var(--mygreen)] text-white mt-6"
        >
          {" "}
          {loading ? <Loading color="white" /> : "register"}
        </Button>
        <div className="flex flex-row justify-center gap-x-6 items-center mt-6">
          <p className="text-sm">Already have account?</p>{" "}
          <Button onClick={()=>router.push("/signin")} variant="link" className="text-[var(--mygreen)]">
            login
          </Button>
        </div>
      </div>
    </div>
  );
}
