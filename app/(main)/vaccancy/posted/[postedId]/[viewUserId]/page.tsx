"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ApplicationStatus,
  fetcher,
  generateRoomName,
  NotificationType,
} from "@/lib/constant";
import useSWR from "swr";
import Loading from "@/components/loading";
import { Candidate, Edu, Employ, Language, Project, Skill } from "@/lib/types";
import {
  MapPin,
  MessageCircle,
  Phone,
  Globe,
  MoveRight,
  Copy,
  CopyCheck,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { ProjectCarousel } from "@/components/projectCarousel";
import Zoom from "react-medium-image-zoom";
import { CldImage } from "next-cloudinary";
import "react-medium-image-zoom/dist/styles.css";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { encryptMessage } from "@/lib/encrypt";
import { useAuthStore } from "@/stores/authStore";
dayjs.extend(relativeTime);

import { socket } from "@/lib/socket";

export default function ViewUser() {
  const { viewUserId } = useParams();
  const [copeid, setCopied] = useState<boolean>(false);
  const router = useRouter();
  const { postedId: vaccancyId } = useParams() as { postedId: string };
  const {
    email,
    userId,
    name: recruiter,
  } = useAuthStore() as { userId: string; email: string; name: string };

  const { data, error, isLoading, mutate } = useSWR<Candidate>(
    `/api/vaccancy/applicants/${viewUserId}?vaccancyId=${vaccancyId}`,
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
  const handlePropose = async () => {
    const companyName = data?.name;
    await mutate(
      data
        ? { ...data, jobsProposed: [{ ...data.jobsProposed[0], vaccancyId }] }
        : undefined,
      false
    );
    const message = `<h6 style="color: #2e7d32;">Job Offer Proposal</h6> <br/>You have recived a job proposal from for this postion  https://www.imisebenzi.co.zw/vaccancy/${vaccancyId} <br/> <p>We were impressed by your qualifications and believe your experience could be a strong match for our team. As the next step, we would like to schedule an interview to learn more about your background and to give you the opportunity to ask us questions as well.</p>

  <p>Please reply to this email with your availability over the next few days so that we can coordinate a suitable time for the interview.</p>

  <p>If you have any questions in the meantime, feel free to reach out.</p
  <p>We’re excited about the possibility of working together and look forward to your response.</p>

  <p>Sincerely,<br/>
  <strong>${recruiter}</strong><br/>
  Recruiting Manager</p>`;
    const roomData = {
      name: generateRoomName(email as string, data?.email as string),
      ids: [userId, viewUserId],
    };
    await axios
      .post(`/api/candidate`, { vaccancyId, userId: viewUserId, roomData })
      .then(async ({ data }) => {
        if (data.proposed) {
          socket?.emit("notif", { roomName:  data?.roomName });
          socket?.emit("sendMessage", {
            message: encryptMessage(message),
            userId,
            name: data?.roomName,
            roomId: data?.roomId,
          });
          await axios
            .post("/api/vaccancy/notif", {
              toId: viewUserId,
              targetId: data?.roomId,
              type: NotificationType.proposal,
              isCandidate: true,
              fromName: companyName,
            })
            .catch((err) => console.error(err));
          toast("Candidate successfully proposed ", {
            description: "You can continue to the chats ",
            action: (
              <Button
                size="sm"
                onClick={() => router.push(`/rooms/${data?.roomId}`)}
                className="px-3 rounded-md bg-green-500 text-white text-sm  transition"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                <p>open chat</p>
              </Button>
            ),
          });
        }
      });
    mutate();
  };
  const handleAction = async (
    id: string,
    status: string,
    name: string,
    roomId: string
  ) => {
    const companyName = data?.name;
    await mutate(
      data
        ? { ...data, jobsApplied: [{ ...data.jobsApplied[0], status }] }
        : undefined,
      false
    );
    await axios
      .patch(`/api/vaccancy/applicants/${id}`, { status })
      .then(async ({ data }) => {
        socket?.emit("notif", { roomName: name });
        if (data?.updated) {
          if (status === ApplicationStatus.invited) {
            socket?.emit("sendMessage", {
              message:
                encryptMessage(`<h6 style="color: #2e7d32;">Interview Invitation</h6> <br/>You have recieved an invitation for this position  https://www.imisebenzi.co.zw/vaccancy/${vaccancyId}  After reviewing your application, we are pleased to invite you to the next stage of our recruitment process.</p>

  <p>We were impressed by your qualifications and believe your experience could be a strong match for our team. As the next step, we would like to schedule an interview to learn more about your background and to give you the opportunity to ask us questions as well.</p>

  <p>Please reply to this email with your availability over the next few days so that we can coordinate a suitable time for the interview.</p>

  <p>If you have any questions in the meantime, feel free to reach out.</p
  <p>We look forward to speaking with you soon.</p>

  <p>Sincerely,<br/>
  <strong>${recruiter}</strong><br/>
  Recruiting Manager</p>`),
              userId,
              name,
              roomId,
            });
            await axios
              .post("/api/vaccancy/notif", {
                toId: viewUserId,
                targetId: data?.roomId,
                type: NotificationType.invitation,
                isCandidate: true,
                fromName: companyName,
              })
              .catch((err) => console.error(err));
          } else {
            socket?.emit("sendMessage", {
              message:
                encryptMessage(`<h6 style="color: #c62828;">Application Rejected</h6> <br/>You have recieved an application rejection for this position  https://www.imisebenzi.co.zw/vaccancy/${vaccancyId} <br> <p>Thank you for applying. We truly appreciate your interest in joining our team and the effort you put into your application.</p>

          <p>After careful consideration, we regret to inform you that you have not been selected to move forward in the recruitment process at this time.</p>

          <p>This decision was not easy due to the high quality of applications we received. Although your profile is strong, we have decided to proceed with candidates whose experience and qualifications more closely match the specific requirements of the role.</p>

          <p>We encourage you to apply for future opportunities with us. Your passion and background are impressive, and we’d be happy to consider you for roles that may align better with your skills.</p>

          <p>We wish you the very best in your career journey and thank you again for your interest in this position.</p>

          <p>Sincerely,<br/>
          <strong>${recruiter}</strong> <br/>
          Recruiting Manager</p>`),
              userId,
              name,
              roomId,
            });
            await axios
              .post("/api/vaccancy/notif", {
                toId: viewUserId,
                targetId: data?.roomId,
                type: NotificationType.rejection,
                isCandidate: true,
                fromName: companyName,
              })
              .catch((err) => console.error(err));
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
        <div className="flex gap-4 flex-wrap">
          {data.jobsApplied.length < 1 && (
            <Button
              disabled={data.jobsProposed[0]?.vaccancyId === vaccancyId}
              onClick={handlePropose}
              size="sm"
              className="bg-green-500 w-60 text-white border-none rounded-full [@media(max-width:480px)]:w-full"
            >
              {data.jobsProposed[0]?.vaccancyId === vaccancyId
                ? " proposed"
                : " propose"}
            </Button>
          )}

          {data.jobsApplied.length > 0 && (
            <Button
              onClick={() =>
                handleAction(
                  data.jobsApplied[0]?.id,
                  ApplicationStatus.invited,
                  data.jobsApplied[0].roomName,
                  data.jobsApplied[0].roomId
                )
              }
              disabled={
                data.jobsApplied[0]?.status === ApplicationStatus.invited
              }
              size="sm"
              className="bg-[var(--mygreen)] w-60 text-white border-none rounded-full [@media(max-width:480px)]:w-full"
            >
              {data.jobsApplied[0]?.status === ApplicationStatus.invited
                ? "Invited"
                : "Invite"}
            </Button>
          )}
          {data.jobsApplied.length > 0 && (
            <Button
              onClick={() =>
                handleAction(
                  data.jobsApplied[0]?.id,
                  ApplicationStatus.rejected,
                  data.jobsApplied[0].roomName,
                  data.jobsApplied[0].roomId
                )
              }
              disabled={
                data.jobsApplied[0]?.status === ApplicationStatus.rejected
              }
              size="sm"
              className="bg-red-500 w-60  text-white border-none rounded-full [@media(max-width:480px)]:w-full"
            >
              {data.jobsApplied[0]?.status === ApplicationStatus.rejected
                ? " Rejectd"
                : " Reject"}
            </Button>
          )}
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
