"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { fetcher, Role } from "@/lib/constant";
import useSWR from "swr";
import Loading from "@/components/loading";
import { Candidate, Edu, Employ, Language, Project, Skill } from "@/lib/types";
import EditNameMoadal from "@/components/editNameModal";
import { MapPin, Phone, Globe, MoveRight, Copy,CopyCheck } from "lucide-react";
import EditBioMoadal from "@/components/editBioModal";
import EditEducationMoadal from "@/components/editEducationModal";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EditEmploymentMoadal from "@/components/editEmployment";
import EditSkillMoadal from "@/components/editSkillModal";
import EditProjectMoadal from "@/components/editProjectModal";
import { ProjectCarousel } from "@/components/projectCarousel";
import Zoom from "react-medium-image-zoom";
import { CldImage } from "next-cloudinary";
import "react-medium-image-zoom/dist/styles.css";
import EditProfileImageMoadal from "@/components/editProfileImage";
import EditCompanyInfoMoadal from "@/components/editCompanyInfo";
import EditCompanyMainInfoMoadal from "@/components/editCompanyMainInfo";
import EditContactMoadal from "@/components/editContactModal";

import EditLanguageMoadal from "@/components/editLanguageModal";

dayjs.extend(relativeTime);

export default function Profile() {
  const { userId, role } = useAuthStore();
  const [copeid , setCopied] = useState<boolean>(false)
  const isCandidate = role === Role.candidate;
  const { data, error, isLoading } = useSWR<Candidate>(
    `/api/candidate/${userId}`,
    fetcher
  );
 const handleCopy = async (text:string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true)
      setTimeout(()=>setCopied(false),2000)
    } catch (err) {
      alert("Failed to copy");
      console.error(err)
    }}
  if (isLoading)
    return (
      <div>
        <Loading color="grey" />
      </div>
    );
  if (error) return <div>error fetching</div>;
  if (!data) return null;
  return (
    <div className="flex flex-col gap-y-6 sm:p-4 p-1 mt-4">
      <div className="flex flex-row justify-between border-1  border-stone-200 p-2 rounded-xl">
        <div>
          <div>
            <p>{data?.name}</p>
            {isCandidate ? (
              <p className="text-sm">{data.position}</p>
            ) : (
              <p className="text-sm">{data.companyName}</p>
            )}
            <div className="flex flex-row flex-nowrap gap-x-2">
              <MapPin className="h-w w-4 text-gray-300 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                {!isCandidate && data.address},{data.city},{data.country}
              </p>
            </div>
          </div>
          {isCandidate ? (
            <EditNameMoadal
              name={data.name}
              country={data.country}
              city={data.city}
              position={data.position}
            />
          ) : (
            <EditCompanyMainInfoMoadal
              name={data.name}
              country={data.country}
              city={data.city}
              address={data.address}
              companyName={data.companyName}
            />
          )}
        </div>
        <div>
          <Zoom>
            <div className="w-30 h-30 relative border-4  border-[var(--mygreen)] p-2 rounded-full">
              {data.image && (
                <CldImage
                  src={data.imagePublicId}
                  alt="profile Image"
                  fill
                  className="object-cover rounded-full shadow cursor-zoom-in"
                />
              )}
              <div className="absolute right-0 bottom-0">
                <EditProfileImageMoadal url={data.image} />
              </div>
            </div>
          </Zoom>
        </div>
      </div>
      {/* company info */}
      {!isCandidate && (
        <div className="border-1  border-stone-200 p-2 rounded-xl">
          <div className="flex flex-row justify-between ">
            <p>About Company</p>
            <EditCompanyInfoMoadal companyInfo={data.companyInfo} />
          </div>

          <div
            className="ql-editor text-sm text-gray-600  "
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.companyInfo as string),
            }}
          ></div>
        </div>
      )}
      {isCandidate && (
        <>
          {/* bio */}
          <div className="space-y-2">
            <div className="flex flex-row justify-between ">
              <p>Bio</p>
              <EditBioMoadal bio={data.bio} />
            </div>
            <p className="text-sm text-gray-600">{data.bio}</p>
          </div>
          {/* education */}
          <div className="space-y-2">
            <div className="flex flex-row justify-between ">
              <p>Education</p>

              <EditEducationMoadal
                institution=""
                archievement=""
                startAt={undefined}
                endAt={undefined}
                editMode={false}
                id=""
              />
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
                  <EditEducationMoadal
                    institution={edu.institution}
                    archievement={edu.archievement}
                    startAt={new Date(edu.startAt)}
                    endAt={new Date(edu.endAt)}
                    editMode={true}
                    id={edu.id}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Employment History */}
          <div className="space-y-2">
            <div className="flex flex-row justify-between ">
              <p>Employment History</p>
              <EditEmploymentMoadal
                position=""
                location=""
                roles=""
                company=""
                startAt={undefined}
                endAt={undefined}
                editMode={false}
                id=""
              />
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
                  <EditEmploymentMoadal
                    position={emp.position}
                    location={emp.location}
                    roles={emp.roles}
                    company={emp.company}
                    startAt={new Date(emp.startAt)}
                    endAt={new Date(emp.endAt)}
                    editMode={true}
                    id={emp.id}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Skills */}
          <div className="space-y-2">
            <div className="flex flex-row justify-between ">
              <p>Skills</p>
              <EditSkillMoadal skills={data.skills} />
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
              <EditProjectMoadal
                previousImages={[]}
                title=""
                description=""
                editMode={false}
                id=""
              />
            </div>
            <div className="flex flex-col gap-y-8">
              {data.projects.map((project: Project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-y-2 border-1  border-stone-400 p-2 rounded-xl"
                >
                  <p className=" text-sm ">{project.title}</p>
                  <p className="text-gray-500 text-sm ">
                    {project.description}
                  </p>
                  <ProjectCarousel images={project.images} />
                  <EditProjectMoadal
                    previousImages={project.images}
                    title={project.title}
                    description={project.description}
                    editMode={true}
                    id={project.id}
                  />
                </div>
              ))}
            </div>
          </div>
           {/* languages*/}
          <div className="space-y-2">
            <div className="flex flex-row justify-between ">
              <p>Languages</p>
              <EditLanguageMoadal languages={data.languages} />
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
        </>
      )}
      {/* contact info */}
      <div className="space-y-2">
        <div className="flex flex-row justify-between ">
          <p>Contacts</p>
          <EditContactMoadal
            whatsapp={data.whatsapp}
            telegram={data.telegram}
            faceBook={data.faceBook}
            website={data.website}
            phone={data.phone}
            linkedInn={data.linkedInn}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {data.phone && (
            <div className="w-50  rounded-sm text-white flex flex-nowrap bg-black items-center justify-between px-2 py-1 [@media(max-width:480px)]:w-full [@media(max-width:480px)]:justify-center gap-x-1">
              <Phone className="h-4 w-4" />
              <p className="text-sm ">{data.phone}</p>
              {
                copeid?<CopyCheck className="h-4 w-4"/>:<Copy className="h-4 w-4" onClick={()=>handleCopy(data.phone)} />
              }
              
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
