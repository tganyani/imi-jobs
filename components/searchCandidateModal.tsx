"use client";
import { useEffect, useState } from "react";
import { fetcher, stringToColor } from "@/lib/constant";
import useSWR from "swr";
import Loading from "@/components/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { SearchUser } from "@/lib/types";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SeachCandidateMoadal({
  job,
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    city: string;
    country: string;
  };
}) {
  const [searchTerms, setSearchTerms] = useState<{
    title: string;
    city: string;
    country: string;
  }>({ title: "", city: "", country: "" });

  useEffect(() => {
    setSearchTerms({
      title: job.title,
      city: job.city,
      country: job.country,
    });
  }, [job]);

  const { data, error, isLoading } = useSWR(
    `/api/candidate?title=${searchTerms.title}&city=${searchTerms.city}&country=${searchTerms.country}&batch=10`,
    fetcher
    // {
    //   keepPreviousData: true,
    // }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className=""></DialogTrigger>
      <DialogContent className="flex min-h-100 flex-col items-center border-none sm:p-4 p-2">
        <DialogHeader className="w-full">
          <DialogTitle className="text-start">
            Search potential candidates
          </DialogTitle>
          <DialogDescription className="text-start">
            Find candidates by jobtitle, city and country located
          </DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-2">
          <div className="space-y-2">
            <div className="group ">
              <p className="text-sm group-focus-within:block hidden">title</p>
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
              <p className="text-sm group-focus-within:block hidden">city</p>
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
              <p className="text-sm group-focus-within:block hidden">country</p>
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
          <div>
            {error && <div>error fetching</div>}
            {isLoading ? (
              <Loading color="grey" />
            ) : data?.length > 0 ? (
              data.map((user: SearchUser) => (
                <Link
                  key={user.id}
                  href={`/vaccancy/posted/${job.id}/${user.id}`}
                  className="flex gap-x-4 flex-nowrap items-center hover:bg-stone-100 space-y-2"
                >
                  <Avatar
                    className="text-white"
                    style={{ backgroundColor: stringToColor(user.name) }}
                  >
                    <AvatarImage src={user.image} alt="user-p" />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-ellipsis line-clamp-1">{user.name} </p>
                    <p className="text-sm text-gray-500 text-ellipsis line-clamp-1">{user.position}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm">No candidates match this position</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
