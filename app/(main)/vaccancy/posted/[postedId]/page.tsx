"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { ApplicationStatus, fetcher } from "@/lib/constant";
import useSWR from "swr";
import { Applicant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { socket } from "@/lib/socket";

export default function Applicants() {
  const router = useRouter();
  const { postedId: vaccancyId } = useParams();
  const { userId } = useAuthStore() as { userId: string };
  const searchParams = useSearchParams();
  const vaccancyTitle = searchParams.get("vaccancyTitle");

  const { data, error, isLoading, mutate } = useSWR<Applicant[]>(
    `/api/vaccancy/applicants?vaccancyId=${vaccancyId}&recruiterId=${userId}`,
    fetcher
  );
  const handleAction = async (
    id: string,
    status: string,
    name: string,
    roomId: string
  ) => {
    await mutate(
      data?.map((aplnt) => {
        if (aplnt.id === id) {
          return {
            ...aplnt,
            status,
          };
        }
        return aplnt;
      }),
      false
    );
    await axios
      .patch(`/api/vaccancy/applicants/${id}`, { status })
      .then(({ data }) => {
        if (data?.updated) {
          if (status === ApplicationStatus.invited) {
            socket?.emit("sendMessage", {
              message: "You have recived an invitation",
              userId,
              name,
              roomId,
            });
          } else {
            socket?.emit("sendMessage", {
              message: "You have recived an application rejection",
              userId,
              name,
              roomId,
            });
          }
        }
      })
      .catch((err) => console.error(err));
    await mutate();
  };
  if (isLoading)
    return (
      <div>
        <Loading color="grey" />
      </div>
    );
  if (error) return <div>error fetching</div>;
  if (!data) return null;
  return (
    <div className="flex flex-col gap-y-4 p-1">
      <p className="">
        Applicants for <span className="font-semibold">{vaccancyTitle}</span>
      </p>
      <div className="flex flex-col gap-y-4">
        {data.map((aplnt) => (
          <div
            key={aplnt.id}
            className="flex flex-col gap-y-2 border-1  border-stone-300 p-2 rounded-xl"
          >
            <div className="flex  justify-between overflow-hidden">
              <p className="text-sm truncate whitespace-nowrap overflow-hidden">
                {aplnt.candidateName}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 rounded-full w-50 hover:text-[var(--mygreen)] hover:border-[var(--mygreen)] hover:border-2"
                onClick={() => router.push(`/rooms/${aplnt.roomId}`)}
              >
                <MessageCirclePlus className="h-4 w-4" />
                Start conversation
              </Button>
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">
              {aplnt.coverLetter}
            </p>
            
            <Button
              onClick={() =>
                router.push(`/vaccancy/posted/${vaccancyId}/${aplnt.userId}`)
              }
              variant="link"
              size="sm"
              className=" w-20 text-[var(--mygreen)] h-auto "
            >
              view profile
            </Button>
            <div className="flex gap-4 flex-wrap">
              <Button
                disabled={aplnt.status === ApplicationStatus.invited}
                size="sm"
                className="bg-[var(--mygreen)] w-60 text-white border-none rounded-full [@media(max-width:480px)]:w-full"
                onClick={() =>
                  handleAction(
                    aplnt.id,
                    ApplicationStatus.invited,
                    aplnt.roomName,
                    aplnt.roomId
                  )
                }
              >
                {aplnt.status === ApplicationStatus.invited
                  ? "Invited"
                  : "Invite"}
              </Button>
              <Button
                disabled={aplnt.status === ApplicationStatus.rejected}
                size="sm"
                className="bg-red-500 w-60 text-white border-none rounded-full [@media(max-width:480px)]:w-full"
                onClick={() =>
                  handleAction(
                    aplnt.id,
                    ApplicationStatus.rejected,
                    aplnt.roomName,
                    aplnt.roomId
                  )
                }
              >
                {aplnt.status === ApplicationStatus.rejected
                  ? "Rejected"
                  : "Reject"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
