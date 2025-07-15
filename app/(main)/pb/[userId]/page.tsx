"use client";
import { useState } from "react";
import { useParams} from "next/navigation";
import { fetcher} from "@/lib/constant";
import useSWR from "swr";
import Loading from "@/components/loading";
import { Candidate, Edu, Employ, Language, Project, Skill } from "@/lib/types";
import {
  MapPin,
  Phone,
  Globe,
  MoveRight,
  Copy,
  CopyCheck,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { ProjectCarousel } from "@/components/projectCarousel";
import Zoom from "react-medium-image-zoom";
import { CldImage } from "next-cloudinary";
import "react-medium-image-zoom/dist/styles.css";
dayjs.extend(relativeTime);


export default function ViewPubicUser() {
  const { userId } = useParams();
  const [copeid, setCopied] = useState<boolean>(false);
  const { data, error, isLoading } = useSWR<Candidate>(
    `/api/candidate/${userId}`,
    fetcher
  );
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy");
      console.error(err);
    }
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
    <div className="flex flex-col gap-y-6 p-4">
      <div className="border-1  border-stone-200 p-2 rounded-xl space-y-2">
        <div className="flex flex-row justify-between ">
          <div>
            <div>
              <p>{data?.name}</p>
              <p className="text-sm">{data.position}</p>
              <div className="flex flex-row flex-nowrap gap-x-2">
                <MapPin className="h-w w-4 text-gray-300" />
                <p className="text-sm text-gray-600">
                  {data.city},{data.country}
                </p>
              </div>
            </div>
          </div>
          <div>
            <Zoom>
              <div className="sm:w-30 sm:h-30 w-15 h-15 relative border-4  border-[var(--mygreen)] p-2 rounded-full">
                {data.image && (
                  <CldImage
                    src={data.imagePublicId}
                    alt="profile Image"
                    fill
                    className="object-cover rounded-full shadow cursor-zoom-in"
                  />
                )}
                <div className="absolute right-0 bottom-0"></div>
              </div>
            </Zoom>
          </div>
        </div>
      
      </div>

      {/* bio */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Bio</p>
        </div>
        <p className="text-sm text-gray-600">{data.bio}</p>
      </div>
      {/* education */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Education</p>
        </div>
        <div className="flex flex-row gap-4 flex-wrap ">
          {data.eduction.map((edu: Edu) => (
            <div
              className="w-70 border-1  border-stone-200 p-2 rounded-xl"
              key={edu.id}
            >
              <p className="text-sm">{edu.institution}</p>
              <p className="text-sm">
                {dayjs(edu.startAt).format("MMMM D, YYYY")}-
                {dayjs(edu.endAt).format("MMMM D, YYYY")}
              </p>
              <p className="text-sm text-gray-600">{edu.archievement}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Employment History */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Employment History</p>
        </div>
        <div className="flex flex-row gap-4 flex-wrap ">
          {data.employmentHistory.map((emp: Employ) => (
            <div
              className="w-70 border-1  border-stone-200 p-2 rounded-xl"
              key={emp.id}
            >
              <p>{emp.position}</p>
              <p className="text-sm">
                {emp.company},{emp.location}
              </p>
              <p className="text-sm">
                {dayjs(emp.startAt).format("MMMM D, YYYY")}-
                {dayjs(emp.endAt).format("MMMM D, YYYY")}
              </p>
              <p className="text-sm text-gray-600">{emp.roles}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Skills */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Skills</p>
        </div>
        <div className="flex flex-row gap-4 flex-wrap">
          {data?.skills?.map((skill: Skill) => (
            <div
              key={skill.id}
              className="flex  py-1 w-fit flex-row flex-nowrap border-1  border-stone-400 p-2 rounded-xl"
            >
              <div className="">
                <p className=" text-sm ">{skill.title}</p>
                <p className="text-gray-500 text-sm ">{skill.level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Projects */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Projects</p>
        </div>
        <div className="flex flex-col gap-y-8">
          {data.projects.map((project: Project) => (
            <div
              key={project.id}
              className="flex flex-col gap-y-2 border-1  border-stone-400 p-2 rounded-xl"
            >
              <p className=" text-sm ">{project.title}</p>
              <p className="text-gray-500 text-sm ">{project.description}</p>
              <ProjectCarousel images={project.images} />
            </div>
          ))}
        </div>
      </div>
      {/* languages*/}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Languages</p>
        </div>
        <div className="flex flex-row gap-4 flex-wrap">
          {data?.languages?.map((language: Language) => (
            <div
              key={language.id}
              className="flex  py-1 w-fit flex-row flex-nowrap border-1  border-stone-400 p-2 rounded-xl"
            >
              <div className="">
                <p className=" text-sm ">{language.name}</p>
                <p className="text-gray-500 text-sm ">{language.level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* contact info */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Contacts</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {data.phone && (
            <div className="w-50  rounded-sm text-white flex flex-nowrap bg-black items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-1">
              <Phone className="h-4 w-4" />
              <p className="text-sm ">{data.phone}</p>
              {copeid ? (
                <CopyCheck className="h-4 w-4" />
              ) : (
                <Copy
                  className="h-4 w-4"
                  onClick={() => handleCopy(data.phone)}
                />
              )}
            </div>
          )}
          {data.whatsapp && (
            <a
              href={data.whatsapp}
              className="w-50  rounded-sm text-white flex flex-nowrap bg-green-500 items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-4"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-4 h-4"
              />
              <p className="text-sm ">whats app</p>
              <MoveRight className="h-4 w-4" />
            </a>
          )}
          {data.telegram && (
            <a
              href={data.telegram}
              className="w-50  rounded-sm text-white flex flex-nowrap bg-sky-600 items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-4"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                alt="Telegram"
                className="w-4 h-4"
              />
              <p className="text-sm">telegram</p>
              <MoveRight className="h-4 w-4" />
            </a>
          )}
          {data.faceBook && (
            <a
              href={data.faceBook}
              className="w-50 rounded-sm text-white flex flex-nowrap bg-blue-600 items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-4"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg"
                alt="Facebook"
                className="w-4 h-4"
              />
              <p className="text-sm">facebook</p>
              <MoveRight className="h-4 w-4" />
            </a>
          )}
          {data.linkedInn && (
            <a
              href={data.linkedInn}
              className="w-50 rounded-sm text-white flex flex-nowrap bg-blue-700 items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-4"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                alt="LinkedIn"
                className="w-4 h-4"
              />
              <p className="text-sm">linked inn</p>
              <MoveRight className="h-4 w-4" />
            </a>
          )}
          {data.website && (
            <a
              href={data.website}
              className="w-50 rounded-sm text-white flex flex-nowrap bg-gray-500 items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-4"
            >
              <Globe className="w-4 h-4" />
              <p className="text-sm">website</p>
              <MoveRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
