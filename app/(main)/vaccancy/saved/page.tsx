"use client";
import useSWR from "swr";
import { fetcher, stripHtml } from "@/lib/constant";
import Loading from "@/components/loading";
import type { Job } from "@/lib/types";
import { Eye, Users, MapPin, Building, Heart, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ApplyModal } from "@/components/applyModal";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
dayjs.extend(relativeTime);

export default function Home() {
  const { userId } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vaccancy/like?userId=${userId}`,
    fetcher
  );
  const handleLike = async (vaccancyId: string) => {
    mutate(
      data.map((job: Job) => {
        if (job.id === vaccancyId) {
          return { ...job, likes: [{ userId }] };
        } else {
          return job;
        }
      }),
      true
    );
    await axios
      .post("/api/vaccancy/like", { vaccancyId, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    mutate();
  };
  const handleDisLike = async (vaccancyId: string) => {
    mutate(
      data.map((job: Job) => {
        if (job.id === vaccancyId) {
          return { ...job, likes: [] };
        } else {
          return job;
        }
      }),
      false
    );
    await axios
      .patch("/api/vaccancy/like", { vaccancyId, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    mutate();
  };
  if (isLoading)
    return (
      <div>
        <Loading color="grey" />
      </div>
    );
  if (error) return <div>error fetching</div>;
  return (
    <div className="space-y-2">
      <p className="mt-4">Saved jobs</p>
      <div className="flex md:flex-row gap-y-8 gap-x-4 flex-col-reverse">
        <div className="flex flex-col gap-y-8">
          {data?.map((job: Job) => (
            <div
              key={job.id}
              className="flex flex-col gap-y-2 border-1 p-2 border-gray-200 rounded-xl shadow-sm"
            >
              <div className="flex flex-row justify-between gap-x-2">
                <p className="text-sm whitespace-nowrap text-ellipsis line-clamp-1">
                  {job.title} 
                </p>
                <div className="flex flex-row flex-nowrap  justify-between border-1 border-[var(--mygreen)] rounded-full">
                  <div className="flex flex-row flex-nowrap items-center justify-between px-2 border-1 border-[var(--mygreen)] rounded-full">
                    <Eye className="h-4 w-4 text-[var(--mygreen)]" />
                    <p className="text-sm text-gray-400 whitespace-nowrap">
                      {job.views.length}
                    </p>
                  </div>
                  <div className="flex flex-row flex-nowrap items-center justify-between px-2 border-1 border-[var(--mygreen)] rounded-full">
                    <Users className="h-4 w-4 text-[var(--mygreen)]" />
                    <p className="text-sm text-gray-400 whitespace-nowrap ">
                      {job.applications.length} 
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {stripHtml(job.description)}
              </p>

              <div className="flex flex-row items-center justify-between">
                <Button
                  variant="link"
                  size="sm"
                  className=" w-20 text-[var(--mygreen)] h-auto "
                >
                  read more ...
                </Button>

                <p className="text-xs">{dayjs(job.updatedAt).fromNow()}</p>
              </div>
              <div className="flex flex-row items-center gap-x-4 flex-wrap gap-y-2">
                <p className="text-xs text-gray-400">{job.companyName}</p>
                <div className="flex flex-row items-center justify-between ">
                  <MapPin className="h-4 w-4 text-[var(--mygreen)]" />
                  <p className="text-xs text-gray-400">
                    {job.city},{job.country}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between ">
                  <Building className="h-4 w-4 text-[var(--mygreen)]" />
                  <p className="text-xs text-gray-400">{job.type}</p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-x-6 flex-wrap-reverse gap-y-4">
                <ApplyModal
                  job={{
                    title: job.title,
                    id: job.id,
                    userId: job.user.id,
                    userEmail: job.user.email,
                  }}
                  searchTerms={{ title: "", city: "", country: "" }}
                  openFilter={false}
                  batch={1}
                  batchSize={10}
                  isSmallScreen={false}
                  disabled={
                    job.applications.filter(
                      (aplcnt) => aplcnt.userId === userId
                    ).length > 0
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    job.likes.filter((like) => like.userId === userId).length >
                    0
                      ? "w-60 text-green-500 border-2 [@media(max-width:480px)]:w-full"
                      : " w-60 text-[var(--mygreen)] [@media(max-width:480px)]:w-full"
                  }
                  onClick={
                    job.likes.filter((like) => like.userId === userId).length >
                    0
                      ? () => handleDisLike(job.id)
                      : () => handleLike(job.id)
                  }
                >
                  {job.likes.filter((like) => like.userId === userId).length >
                  0 ? (
                    <CircleCheck className="text-green-500" />
                  ) : (
                    <Heart className="text-[var(--mygreen)]" />
                  )}

                  {job.likes.filter((like) => like.userId === userId).length > 0
                    ? "reserved"
                    : "reserve job"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
