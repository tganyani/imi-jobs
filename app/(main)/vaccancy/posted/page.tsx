"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { fetcher, stripHtml } from "@/lib/constant";
import useSWR from "swr";
import Loading from "@/components/loading";
import { ViewJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CircleArrowOutUpRight, Eye, Search } from "lucide-react";
import EditVaccancy from "@/components/editVaccancy";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import SeachCandidateMoadal from "@/components/searchCandidateModal";


dayjs.extend(relativeTime);

export default function JobsPosted() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [currentId, setCurrentId] = useState<string>("");
  const [currentJob, setCurrentJob] = useState<{
    id: string;
    title: string;
    city: string;
    country: string;
  }>({
    title: "Tgb",
    city: "",
    country: "",
    id: "",
  });
  const [open, setOpen] = useState<boolean>(false);
  const { data, error, isLoading, mutate } = useSWR<ViewJob[]>(
    `/api/vaccancy/user/${userId}`,
    fetcher
  );

  const handleJobState = async (active: boolean, vaccancyId: string) => {
    setCurrentId(vaccancyId);
    await axios
      .patch(`/api/vaccancy/${vaccancyId}`, { active })
      .then(({ data }) => {
        if (data.updated) {
          mutate();
          if (active) {
            toast("Job successfully published", {
              description: "Now you can recieve new applications from clients ",
              action: (
                <Button
                  size="sm"
                  onClick={() => console.log("closed")}
                  className="px-3 rounded-md bg-[var(--mygreen)] text-white text-sm hover:bg-green-600 transition"
                >
                  close
                </Button>
              ),
            });
          } else {
            toast("Job successfully unpublished ", {
              description:
                "Now you can not recieve applications from clients you can publish it later ",
              action: (
                <Button
                  size="sm"
                  onClick={() => console.log("closed")}
                  className="px-3 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 transition"
                >
                  close
                </Button>
              ),
            });
          }
        }
      })
      .catch((err) => console.log(err));
    setCurrentId("124dKashambeZhaugweDosertVillage7");
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
    <div className="space-y-4 p-1">
      <p>Posted vaccancies </p>
      <div className="flex flex-col gap-y-8">
        {data.map((job) => (
          <div
            key={job.id}
            className={`flex flex-col gap-y-2 border-1  ${
              job.active ? "border-stone-300" : "border-red-500"
            } p-2 rounded-xl`}
          >
            <div className="flex flex-row items-center justify-between">
              <p className="text-sm">{job.title}</p>
              <Button
                variant="outline"
                size="sm"
                className="  h-auto py-1 text-gray-500 rounded-full w-50 border-1  border-stone-400 hover:border-stone-600 hover:text-gray-600"
                onClick={() => {
                  setCurrentJob({
                    title: job.title,
                    city: job.city,
                    country: job.country,
                    id: job.id,
                  });
                  setOpen(true);
                }}
              >
                <Search className="h-4 w-4 text-stone-400" />
                potential candidates
              </Button>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">
              {stripHtml(job.description)}
            </p>
            <div className="flex flex-row items-center justify-between">
              <Button
                variant="link"
                size="sm"
                className=" w-20 text-[var(--mygreen)] h-auto "
                onClick={()=>router.push(`/vaccancy/${job.id}`)}
              >
                read more ...
              </Button>
              <p className="text-xs">{dayjs(job.updatedAt).fromNow()}</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex justify-between flex-nowrap w-full md:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="  h-auto py-1 text-gray-500  w-50  "
                >
                  <Eye className="h-4 w-4 text-stone-400" />
                  <p>{job.views}</p>
                  candidates viewed
                </Button>
                <div className="md:hidden flex ">
                  <EditVaccancy job={job} byId={false} />
                </div>
              </div>
              <div className="flex flex-nowrap gap-4 justify-between md:justify-start md:w-auto w-full [@media(max-width:480px)]:flex-wrap">
                <Button
                  disabled={job.nApplications < 1}
                  variant="outline"
                  size="sm"
                  className=" text-[var(--mygreen)] h-auto py-1 rounded-full w-50 hover:text-green-500 [@media(max-width:480px)]:w-full"
                  onClick={() =>
                    router.push(
                      `/vaccancy/posted/${
                        job.id
                      }?vaccancyTitle=${encodeURIComponent(job.title)}`
                    )
                  }
                >
                  {job.nApplications > 0 && "view"}
                  <p>{job.nApplications}</p> applicants
                  {job.nApplications > 0 && (
                    <CircleArrowOutUpRight className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  onClick={() => handleJobState(!job.active, job.id)}
                  variant="outline"
                  size="sm"
                  className={` h-auto py-1 text-white bg-[var(--mygreen)] ${
                    job.active ? "hover:bg-red-500" : "hover:bg-green-500"
                  } rounded-full w-50 [@media(max-width:480px)]:w-full`}
                >
                  {currentId === job.id ? (
                    <Loading color="white" />
                  ) : job.active ? (
                    "unpublish"
                  ) : (
                    "publish again"
                  )}
                </Button>
              </div>
              <div className="md:flex hidden md:flex-1 justify-end">
                <EditVaccancy job={job} byId={false} />
              </div>
            </div>
          </div>
        ))}
        <SeachCandidateMoadal job={currentJob} open={open} setOpen={setOpen} />
      </div>
    </div>
  );
}
