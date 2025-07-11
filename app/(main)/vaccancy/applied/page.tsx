"use client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { useAuthStore } from "@/stores/authStore";
import { ApplicationStatus, fetcher } from "@/lib/constant";
import { type Application } from "@/lib/types";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Eye, MessageCircle, Users } from "lucide-react";

dayjs.extend(relativeTime);

export default function Applications() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { data, error, isLoading } = useSWR<Application[]>(
    `/api/vaccancy/user?userId=${userId}`,
    fetcher
  );
  if (isLoading)
    return (
      <div>
        <Loading color="grey" />
      </div>
    );
  if (error) return <div>error fetching</div>;
  if (!data) return null;
  return (
    <div className="space-y-2 p-1">
      <p className="mt-4">Applied Jobs</p>
      <div className="flex flex-col gap-y-8">
        {data.map((aplcn: Application) => (
          <div
            key={aplcn.id}
            className="flex flex-col gap-y-1 border-1 p-2 border-gray-200 rounded-xl shadow-xsm space-y-2"
          >
            <div className="flex flex-nowrap justify-between items-center gap-x-2 ">
              <p className="text-sm truncate text-ellipsis overflow-hidden whitespace-nowrap">{aplcn.jobTitle} </p>
              {aplcn.status === ApplicationStatus.rejected ? (
                <div className="text-sm   text-white text-center px-2 w-30 sm:px-4 py-1 sm:w-40 bg-red-500 rounded-full">
                  {aplcn.status}
                </div>
              ) : aplcn.status === ApplicationStatus.invited ? (
                <div
                  onClick={() => router.push(`/rooms/${aplcn.roomId}`)}
                  className="flex justify-around items-center flex-nowrap w-30 px-2 hover:border-stone-200 hover:bg-green-600 border-2  text-sm text-white sm:px-4 py-1 sm:w-40 bg-green-500 rounded-full"
                >
                  {aplcn.status} <MessageCircle className="h-4 w-4 " />
                </div>
              ) : (
                <div className="  text-sm text-gray-400 text-center px-2 w-30 sm:px-4 py-1 sm:w-40 bg-gray-200 rounded-full">
                  {aplcn.status}...
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{aplcn.letter} </p>
            <div className="flex flex-row justify-between items-center ">
              <Button
              onClick={()=>router.push(`/vaccancy/${aplcn.jobId}`)}
                variant="link"
                size="sm"
                className="ml-2 w-20 text-[var(--mygreen)] h-auto "
              >
                view vaccancy
              </Button>
              <p className="text-sm  px-4">
                {dayjs(aplcn.createdAt).fromNow()}
              </p>
            </div>
            <div className="flex flex-row gap-x-6 items-center ">
              <div className="flex flex-row flex-nowrap min-w-25 justify-between text-sm items-center border-1 rounded-full py-1 px-2 border-stone-200">
                <div className="flex flex-row flex-nowrap  items-center truncate text-ellipsis overflow-hidden whitespace-nowrap">
                  <Users className="h-4 w-4 text-gray-400 shrink-0" />
                  {aplcn.nApplications} 
                </div>
                <p> applied</p>
              </div>
              <div className="flex flex-row flex-nowrap min-w-25 justify-between text-sm items-center border-1 rounded-full py-1 px-2 border-stone-200 ">
                <div className="flex flex-row flex-nowrap  items-center truncate text-ellipsis overflow-hidden whitespace-nowrap">
                  <Eye className="h-4 w-4 text-gray-400 shrink-0" />
                  {aplcn.nViews}
                </div>
                <p> viewed</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
