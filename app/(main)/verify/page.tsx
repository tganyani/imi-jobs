"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useResendStore } from "@/stores/resendCodeStore";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Loading from "@/components/loading";
import { Suspense } from "react";
import axios from "axios";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { encryptMessage} from "@/lib/encrypt";
import { generateRoomName } from "@/lib/constant";
import { socket } from "@/lib/socket";

type Inputs = {
  code: string;
};
const COUNTDOWN_SECONDS = 30;

const VerifyPasswordComponent = () => {
  const searchParams = useSearchParams();
  const {
    lastResend,
    setLastResend,
    triggerOnMount,
    setTriggerOnMount,
    reset,
    hasHydrated,
  } = useResendStore();
  const router = useRouter();
  const email = searchParams.get("email");
  const fpasswsord = searchParams.get("fpassword");
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [logError, setLogError] = useState<string>("");
  // Auto-trigger only once when redirected
  useEffect(() => {
    if (!hasHydrated) return;
    else if (triggerOnMount) {
      const now = Date.now();
      setLastResend(now);
      setTimeLeft(COUNTDOWN_SECONDS);
      setTriggerOnMount(false); // only trigger once
      setCanResend(false);
    } else if (lastResend) {
      const elapsed = Math.floor((Date.now() - lastResend) / 1000);
      const remaining = COUNTDOWN_SECONDS - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
        setCanResend(false);
      }
    }
  }, [hasHydrated, triggerOnMount]);

  // Countdown logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          reset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

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

  // auto reset log error on code change
  useEffect(() => {
    setLogError("");
  }, [code]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/verify", {
        code: data.code,
        email,
        adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      })
      .then(async ({ data }) => {
        setLogError(data?.error);
        if (data.verified) {
          toast(`Email successfully verified `);
          if (fpasswsord) {
            router.push(`/rpassword?email=${encodeURIComponent(data?.email)}`);
          } else {
            await axios
              .post("/api/room", {
                name: generateRoomName(
                  process.env.NEXT_PUBLIC_ADMIN_EMAIL as string,
                  email as string
                ),
                ids: data?.ids,
              })
              .then((res) => {
                if (res.data.created) {
                  socket?.emit("sendMessage", {
                    message: encryptMessage(`Hello ${data.userName}! welcome to imisebenzi ,you can post or apply jobs here `),
                    userId: data.userId,
                    name: res.data.name,
                    roomId: res.data.id,
                  });
                }
              });
            router.push("/signin");
          }
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };

  const handleResend = async () => {
    const now = Date.now();
    setLastResend(now);
    setTimeLeft(COUNTDOWN_SECONDS);
    setCanResend(false);
    await axios
      .post("/api/rcode", { email })
      .then(({ data }) => {
        if (data.codeSend) {
          toast(`Verification code sent to ${email}`);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-2 gap-y-4">
      <p>Verify your email</p>
      <p className="text-sm">We have send the verification code to</p>
      <p className="text-sm text-gray-400">{email}</p>
      <div className="w-full sm:w-100">
        <p className="text-sm text-red-500">{logError}</p>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              value={field.value}
              onChange={field.onChange}
            >
              <InputOTPGroup className="flex w-full sm:w-100 flex-row justify-between mt-6">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="  border-gray-300 rounded-md "
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
          className="sm:w-100 font-bold w-full bg-[var(--mygreen)] text-white mt-6"
          onClick={handleSubmit(onSubmit)}
          disabled={!allFilled || loading}
        >
          {loading ? <Loading color="white" /> : "verify"}
        </Button>
      </div>
      <div className="flex flex-row gap-4 justify-center items-center">
        <p className="text-sm">Did not recieve the code ?</p>
        {canResend ? (
          <Button
            variant="ghost"
            className="font-bold text-[var(--mygreen)] hover:text-green-500"
            onClick={handleResend}
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            resend
          </Button>
        ) : (
          <p className="text-sm font-bold text-[var(--mygreen)]">{timeLeft}</p>
        )}
      </div>
    </div>
  );
};

export default function VerifyPassword() {
  return (
    <Suspense fallback={<Loading color="gray" />}>
      <VerifyPasswordComponent />
    </Suspense>
  );
}
