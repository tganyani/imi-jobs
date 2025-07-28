"use client";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { mutate } from "swr";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import Loading from "./loading";
import { generateRoomName, NotificationType } from "@/lib/constant";
import { toast } from "sonner";
import { encryptMessage} from "@/lib/encrypt";

// import { getSocket } from "@/lib/socket";
import { socket } from "@/lib/socket";
type Inputs = {
  coverLetter: string;
};

export function ApplyModal({
  job,
  disabled,
  searchTerms,
  isSmallScreen,
  openFilter,
  batchSize,
  batch,
}: {
  job: { title: string; id: string; userId: string; userEmail: string };
  isSmallScreen: boolean;
  searchTerms: {
    title: string;
    city: string;
    country: string;
  };
  openFilter: boolean;
  batch: number;
  batchSize: number;
  disabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [letter, setLetter] = useState<string>("");

  const { userId, email, isLoggedIn, name } = useAuthStore() as {
    userId: string;
    email: string;
    isLoggedIn: boolean;
    name: string;
  };
  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    const fetchLetter = async () => {
      if (isLoggedIn) {
        await axios
          .get(`/api/vaccancy/letter?userId=${userId}`)
          .then(({ data }) => {
            setLetter(data?.coverLetter);
          })
          .catch((err) => console.error(err));
      }
    };
    fetchLetter();
  }, [userId, open]);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await axios
      .post("/api/vaccancy/view", { vaccancyId: job.id, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    await axios
      .post("/api/vaccancy/apply", {
        ...data,
        vaccancyId: job.id,
        userId,
        name: generateRoomName(email as string, job.userEmail),

        ids: [job.userId, userId],
      })
      .then(async ({ data }) => {
        if (data?.created) {
          socket?.emit("sendMessage", {
            message: encryptMessage(`<h6 style="color: #2e7d32;">Job Application from ${name} for ${
              job.title
            } position</h6> <br/>${watch(
              "coverLetter"
            )}<br/>, here is my profile <br/>
            https://www.imisebenzi.co.zw/vaccancy/posted/${
              job.id
            }/${userId}
            `),
            userId,
            name: data.roomName,
            roomId: data.roomId,
          });
          socket?.emit("notif", { roomName: data.roomName });
          toast("Profile successfully connected", {
            description: "Now you can wait for feedback ",
            action: (
              <Button
                size="sm"
                onClick={() => router.push(`/vaccancy/applied`)}
                className="px-3 rounded-md bg-[var(--mygreen)] text-white text-sm hover:bg-green-600 transition"
              >
                view application
              </Button>
            ),
          });
          await axios
            .post("/api/vaccancy/notif", {
              toId: job.userId,
              targetId: data.roomName,
              type: NotificationType.application,
              isCandidate: false,
              fromName: name,
            })
            .catch((err) => console.error(err));
          socket?.emit("notif", { roomName: data.roomName });
          mutate(
            `/api/vaccancy?title=${searchTerms.title}&city=${
              openFilter || !isSmallScreen ? searchTerms.city : ""
            }&country=${
              openFilter || !isSmallScreen ? searchTerms.country : ""
            }&batch=${batch * batchSize}`
          );
          mutate(`/api/vaccancy/like?userId=${userId}`)
          mutate(`/api/vaccancy/${job.id}`);
          setTimeout(() => setOpen(false), 2000);
        }
      })
      .catch((err) => console.error(err));
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="bg-[var(--mygreen)] w-60 text-white border-none [@media(max-width:480px)]:w-full"
        >
          {disabled ? "applied" : "Apply direct"}
        </Button>
      </DialogTrigger>
      {isLoggedIn ? (
        <DialogContent className="sm:max-w-150 max-w-screen sm:px-4 px-2 border-none ">
          <DialogHeader>
            <DialogTitle className="font-semibold text-sm text-start">
              Job application
            </DialogTitle>
            <DialogDescription className="text-sm text-start">
              You are applying for{" "}
              <span className="font-bold">{job.title}</span> position
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-sm">cover letter</p>
            <Textarea
              placeholder="Type your message here."
              {...register("coverLetter", { required: true })}
              className="focus-visible:ring-1 text-sm"
            />
            {errors.coverLetter && (
              <span className="text-red-500 text-sm ">
                This field is required
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="text-[var(--mygreen)] "
              onClick={() => reset({ coverLetter: letter })}
            >
              insert previous letter
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="bg-[var(--mygreen)] w-60 text-white border-none [@media(max-width:480px)]:w-full"
              onClick={handleSubmit(onSubmit)}
            >
              {loading ? <Loading color="white" /> : "connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-100 max-w-[calc(100vw-8px)]sm:px-4 px-2 border-none ">
          <DialogHeader>
            <DialogTitle className="font-semibold text-sm text-start">
              You are not logged in
            </DialogTitle>
            <DialogDescription className="text-sm text-start">
              Please log in first before applying.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="bg-[var(--mygreen)] w-60 text-white border-none [@media(max-width:480px)]:w-full"
              onClick={() => router.push("/signin")}
            >
              login
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
