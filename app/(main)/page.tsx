"use client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { fetcher, stripHtml } from "@/lib/constant";
import Loading from "@/components/loading";
import type { Job } from "@/lib/types";

import {
  Eye,
  Users,
  MapPin,
  Building,
  Heart,
  Search,
  CircleCheck,
  Settings2,
  ArrowDownFromLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "react-responsive";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ApplyModal } from "@/components/applyModal";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import CheckAccess from "@/components/checkAccess";
import { useState } from "react";
import FlagJob from "@/components/flagJob";
dayjs.extend(relativeTime);

// import { getSocket } from "@/lib/socket";

// const socket = getSocket();

export default function Home() {
  const batchSize = 5;
  const isSmallScreen = useMediaQuery({ maxWidth: 1024 });
  const router = useRouter();
  const { userId, isLoggedIn } = useAuthStore();
  const [searchTerms, setSearchTerms] = useState<{
    title: string;
    city: string;
    country: string;
  }>({ title: "", city: "", country: "" });
  const [batch, setBatch] = useState<number>(1);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vaccancy?title=${searchTerms.title}&city=${
      openFilter || !isSmallScreen ? searchTerms.city : ""
    }&country=${
      openFilter || !isSmallScreen ? searchTerms.country : ""
    }&batch=${batch * batchSize}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const handleOpenFilter = () => {
    setOpenFilter((current) => !current);
  };

  const handleLike = async (vaccancyId: string) => {
    mutate(
      {
        ...data,
        vaccancies: data?.vaccancies?.map((job: Job) => {
          if (job.id === vaccancyId) {
            return { ...job, likes: [{ userId }] };
          } else {
            return job;
          }
        }),
      },
      false
    );
    await axios
      .post("/api/vaccancy/like", { vaccancyId, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    mutate();
  };
  const handleDisLike = async (vaccancyId: string) => {
    mutate(
      {
        ...data,
        vaccancies: data?.vaccancies?.map((job: Job) => {
          if (job.id === vaccancyId) {
            return { ...job, likes: [] };
          } else {
            return job;
          }
        }),
      },
      false
    );
    await axios
      .patch("/api/vaccancy/like", { vaccancyId, userId })
      .then((res) => res.data)
      .catch((err) => console.error(err));
    mutate();
  };
  const handleView = async (vaccancyId: string) => {
    if (isLoggedIn) {
      await axios
        .post("/api/vaccancy/view", { vaccancyId, userId })
        .then((res) => res.data)
        .catch((err) => console.error(err));
      mutate();
    }
  };

  return (
    <div className="p-2">
      <CheckAccess />
      <p className="my-2">Jobs</p>
      <div className="flex lg:flex-row gap-y-8 gap-x-4 flex-col-reverse">
        {error && <div>error fetching</div>}
        <div className="flex flex-col gap-y-8 flex-1">
          {isLoading && !data ? (
            <Loading color="grey" />
          ) : (
            data?.vaccancies?.map((job: Job) => (
              <div
                key={job.id}
                className="flex flex-col gap-y-2 border-1 p-2 border-gray-200 rounded-xl shadow-sm"
              >
                <div className="flex flex-row justify-between gap-x-2">
                  <p className="text-sm whitespace-nowrap text-ellipsis line-clamp-1">
                    {job.title}{" "}
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
                    onClick={() => {
                      router.push(`/vaccancy/${job.id}`);
                      handleView(job.id);
                    }}
                  >
                    read more ...
                  </Button>

                  <p className="text-xs">{dayjs(job.updatedAt).fromNow()}</p>
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-x-4  gap-y-2">
                  <p className="text-xs  flex-1/3 text-gray-400 whitespace-nowrap text-ellipsis line-clamp-1">
                    {job.companyName}
                  </p>
                  <div className="flex flex-1/3 flex-row items-center gap-x-2 overflow-hidden">
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--mygreen)]" />
                    <p className="text-xs text-gray-400 whitespace-nowrap text-ellipsis line-clamp-1">
                      {job.city},{job.country}
                    </p>
                  </div>
                  <div className="flex flex-1/3 flex-row gap-x-2 items-center">
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
                    // socket={socket}
                    disabled={
                      job.applications.filter(
                        (aplcnt) => aplcnt.userId === userId
                      ).length > 0
                    }
                    searchTerms={searchTerms}
                    openFilter={openFilter}
                    batch={batch}
                    batchSize={batchSize}
                    isSmallScreen={isSmallScreen}
                  />
                  {isLoggedIn && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={
                        job.likes.filter((like) => like.userId === userId)
                          .length > 0
                          ? "w-60 text-green-500 border-2 [@media(max-width:480px)]:w-full"
                          : " w-60 text-[var(--mygreen)] [@media(max-width:480px)]:w-full "
                      }
                      onClick={
                        job.likes.filter((like) => like.userId === userId)
                          .length > 0
                          ? () => handleDisLike(job.id)
                          : () => handleLike(job.id)
                      }
                    >
                      {job.likes.filter((like) => like.userId === userId)
                        .length > 0 ? (
                        <CircleCheck className="text-green-500 [@media(max-width:480px)]:mr-6" />
                      ) : (
                        <Heart className="text-[var(--mygreen)] [@media(max-width:480px)]:mr-4" />
                      )}

                      {job.likes.filter((like) => like.userId === userId)
                        .length > 0
                        ? "reserved"
                        : "reserve job"}
                    </Button>
                  )}
                  <FlagJob />
                </div>
              </div>
            ))
          )}
          {batchSize * batch < data?.total && (
            <div className="flex  p-3">
              <Button
                className="bg-[var(--mygreen)] w-60 rounded-full text-white [@media(max-width:480px)]:w-full"
                onClick={() => setBatch(batch + 1)}
              >
                <ArrowDownFromLine className="text-white" />
                {isLoading ? (
                  <Loading color="white" />
                ) : (
                  <p>
                    load more{" "}
                    <span className="font-bold">
                      {data?.total - batch * batchSize}
                    </span>{" "}
                    jobs
                  </p>
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="lg:hidden block sticky top-0 bg-white ">
          <div className="flex flex-nowrap gap-x-4 justify-between">
            {openFilter ? (
              <div className="flex flex-1 flex-col gap-y-4 border-1 rounded-xl p-4 border-gray-200 shadow-sm ">
                <div className="group ">
                  <p className="text-sm group-focus-within:block hidden">
                    title
                  </p>
                  <div className="flex flex-nowrap  items-center border-1 border-stone-300 rounded-full ">
                    <Input
                      className="h-8 text-sm focus-visible:ring-1 focus:border-stone-500 rounded-full border-none"
                      placeholder="title"
                      onChange={(e) =>
                        setSearchTerms({
                          ...searchTerms,
                          title: e.target.value,
                        })
                      }
                      value={searchTerms.title}
                    />
                    <Search className="h-4 w-4 text-stone-600 group-focus-within:hidden mr-4" />
                  </div>
                </div>

                <div className="group ">
                  <p className="text-sm group-focus-within:block hidden">
                    city
                  </p>
                  <Input
                    className="h-8 text-sm focus-visible:ring-1 focus:border-stone-500 rounded-full border-stone-300"
                    placeholder="city"
                    onChange={(e) =>
                      setSearchTerms({ ...searchTerms, city: e.target.value })
                    }
                    value={searchTerms.city}
                  />
                </div>
                <div className="group ">
                  <p className="text-sm group-focus-within:block hidden">
                    country
                  </p>
                  <Input
                    className="h-8 text-sm  focus-visible:ring-1 focus:border-stone-500 rounded-full border-stone-300"
                    placeholder="country"
                    onChange={(e) =>
                      setSearchTerms({
                        ...searchTerms,
                        country: e.target.value,
                      })
                    }
                    value={searchTerms.country}
                  />
                </div>
              </div>
            ) : (
              <div className="group flex-1">
                <p className="text-sm group-focus-within:block hidden">title</p>
                <div className="flex  flex-nowrap items-center border-1 border-stone-300 rounded-full mb-4 ">
                  <Input
                    className="h-8 text-sm focus-visible:ring-1 focus:border-stone-500 rounded-full border-none"
                    placeholder="title"
                    onChange={(e) =>
                      setSearchTerms({ ...searchTerms, title: e.target.value })
                    }
                    value={searchTerms.title}
                  />
                  <Search className="h-4 w-4 text-stone-600 group-focus-within:hidden mr-4" />
                </div>
              </div>
            )}

            <div
              onClick={handleOpenFilter}
              className="h-8   flex justify-center p-2 items-center border-1 border-stone-300 rounded-full"
            >
              <Settings2 className="h-4 w-4 text-stone-600" />
            </div>
          </div>
        </div>
        <div className="mr-2 p-5 hidden lg:flex h-60 flex-col items-center border-1 rounded-xl border-gray-200 shadow-sm">
          <Search className="h-4 w-4 text-[var(--mygreen)]" />
          <div className=" ">
            <p className=" text-sm">title</p>
            <Input
              onChange={(e) =>
                setSearchTerms({ ...searchTerms, title: e.target.value })
              }
              className="seachInputs"
              value={searchTerms.title}
            />
          </div>
          <div className=" ">
            <p className=" text-sm">city</p>
            <Input
              onChange={(e) =>
                setSearchTerms({ ...searchTerms, city: e.target.value })
              }
              className="seachInputs"
              value={searchTerms.city}
            />
          </div>
          <div className=" ">
            <p className=" text-sm">country</p>
            <Input
              onChange={(e) =>
                setSearchTerms({ ...searchTerms, country: e.target.value })
              }
              className="seachInputs"
              value={searchTerms.country}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
