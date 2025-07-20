"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import useSWR from "swr";
import Loading from "@/components/loading";
import { fetcher, stringToColor } from "@/lib/constant";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { Eye, Users, CircleCheck } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ApplyModal } from "@/components/applyModal";
import axios from "axios";
import FlagJob from "@/components/flagJob";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import EditVaccancy from "@/components/editVaccancy";
// import { ViewJob } from "@/lib/types";

dayjs.extend(relativeTime);

export default function Vaccancy() {
  const { userId, isLoggedIn } = useAuthStore();
  const { vaccancyId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vaccancy/${vaccancyId}`,
    fetcher
  );
  const handleLike = async (vaccancyId: string) => {
    mutate({ ...data, likes: [{ userId }] }, false);
    await axios
      .post("/api/vaccancy/like", { vaccancyId, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    mutate();
  };
  const handleDisLike = async (vaccancyId: string) => {
    mutate({ ...data, likes: [] }, false);
    await axios
      .patch("/api/vaccancy/like", { vaccancyId, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    mutate();
  };
  const handleJobState = async (active: boolean, vaccancyId: string) => {
    setLoading(true);
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
    setLoading(false);
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
    <div className="flex flex-col gap-y-6 p-2">
      <div className="border-1 border-stone-300 rounded-sm p-2 sticky top-0 bg-white z-2">
        <div className="flex flex-row flex-nowrap justify-between ">
          <p className="">{data?.title}</p> <p className="">{data?.salary}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-nowrap gap-x-4 items-center ">
              <Avatar
                className="text-white"
                style={{ backgroundColor: stringToColor(data?.companyName) }}
              >
                <AvatarImage
                  src="https://github.com/shadcnf.png"
                  alt="@shadcn"
                />
                <AvatarFallback>{data?.companyName[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm ">{data?.companyName}</p>
            </div>
            <div className="flex flex-row gap-x-1 flex-nowrap items-center  ">
              <MapPin className="h-4 w-4 text-[var(--mygreen)]" />
              <p className="text-sm  text-gray-500">
                {data?.city},{data?.country}
              </p>
            </div>
          </div>

          {userId === data?.user?.id ? (
            <Button
              onClick={() => handleJobState(!data.active, data.id)}
              variant="outline"
              size="sm"
              className={` h-auto py-1 text-white bg-[var(--mygreen)] ${
                data.active ? "hover:bg-red-500" : "hover:bg-green-500"
              } rounded-full w-50 [@media(max-width:480px)]:w-full`}
            >
              {loading ? (
                <Loading color="white" />
              ) : data.active ? (
                "unpublish"
              ) : (
                "publish again"
              )}
            </Button>
          ) : (
            <ApplyModal
              job={{
                title: data?.title as string,
                id: data?.id as string,
                userId: data.user.id,
                userEmail: data.user.email,
              }}
              disabled={
                data.applications.filter(
                  (aplcnt: { userId: string }) => aplcnt.userId === userId
                ).length > 0
              }
              searchTerms={{ title: "", city: "", country: "" }}
              openFilter={false}
              batch={1}
              batchSize={5}
              isSmallScreen={false}
            />
          )}
        </div>
      </div>
      {/* about company */}
      {data?.user?.companyInfo && (
        <div className=" border-1 border-stone-300 rounded-sm p-2">
          <div
            className="ql-editor text-sm text-gray-600  "
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data?.user?.companyInfo as string),
            }}
          ></div>
        </div>
      )}

      <div className="min-h-screen border-1 border-stone-300 rounded-sm p-2">
        {/* <p>Job info</p> */}
        <div
          className="ql-editor text-sm text-gray-600  "
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(data?.description as string),
          }}
        ></div>
      </div>
      <div>
        <p className="text-sm mb-2">statistics</p>

        <div className="flex flex-wrap justify-between gap-y-2 items-center gap-x-4">
          <div className="flex flex-wrap gap-x-6 items-center gap-y-2 ">
            <div className="flex flex-row flex-nowrap min-w-25 justify-between text-sm items-center border-1 rounded-full py-1 px-2 border-stone-200">
              <div className="flex flex-row flex-nowrap  items-center truncate text-ellipsis overflow-hidden whitespace-nowrap">
                <Users className="h-4 w-4 text-gray-400" />
                {data?.nApplications}
              </div>
              <p> applied</p>
            </div>
            <div className="flex flex-row flex-nowrap min-w-25 justify-between text-sm items-center border-1 rounded-full py-1 px-2 border-stone-200">
              <div className="flex flex-row flex-nowrap  items-center truncate text-ellipsis overflow-hidden whitespace-nowrap">
                <Eye className="h-4 w-4 text-gray-400" />
                {data?.nViews}
              </div>
              <p> viewed</p>
            </div>
          </div>
          <p className="text-sm ">posted {dayjs(data?.updatedAt).fromNow()}</p>
        </div>
      </div>
      {userId === data?.user?.id ? (
        <EditVaccancy job={data} byId={true} />
      ) : (
        <div className="flex flex-row items-center gap-x-6 flex-wrap-reverse gap-y-4">
          <ApplyModal
            job={{
              title: data?.title as string,
              id: data?.id as string,
              userId: data.user.id,
              userEmail: data.user.email,
            }}
            disabled={
              data.applications.filter(
                (aplcnt: { userId: string }) => aplcnt.userId === userId
              ).length > 0
            }
            searchTerms={{ title: "", city: "", country: "" }}
            openFilter={false}
            batch={1}
            batchSize={5}
            isSmallScreen={false}
          />
          {isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              className={
                data.likes.filter(
                  (like: { userId: string }) => like?.userId === userId
                )?.length > 0
                  ? "w-60 text-green-500 border-2 [@media(max-width:480px)]:w-full"
                  : " w-60 text-[var(--mygreen)] [@media(max-width:480px)]:w-full"
              }
              onClick={
                data.likes?.filter(
                  (like: { userId: string }) => like?.userId === userId
                )?.length > 0
                  ? () => handleDisLike(data.id)
                  : () => handleLike(data.id)
              }
            >
              {data.likes?.filter(
                (like: { userId: string }) => like?.userId === userId
              )?.length > 0 ? (
                <CircleCheck className="text-green-500" />
              ) : (
                <Heart className="text-[var(--mygreen)]" />
              )}

              {data.likes.filter(
                (like: { userId: string }) => like?.userId === userId
              )?.length > 0
                ? "reserved"
                : "reserve job"}
            </Button>
          )}
          <FlagJob />
        </div>
      )}
    </div>
  );
}
