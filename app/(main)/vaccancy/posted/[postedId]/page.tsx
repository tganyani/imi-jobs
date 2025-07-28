"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { ApplicationStatus, fetcher, NotificationType } from "@/lib/constant";
import useSWR from "swr";
import { Applicant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { Suspense } from "react";
import { socket } from "@/lib/socket";
import { encryptMessage } from "@/lib/encrypt";

const ApplicantComponent = () => {
  const router = useRouter();
  const { postedId: vaccancyId } = useParams();
  const { userId, name: recruiter } = useAuthStore() as {
    userId: string;
    name: string;
  };

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
    roomId: string,
    toId: string,
    fromName: string
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
      .then(async ({ data }) => {
        if (data?.updated) {
          socket?.emit("notif", { roomName: name });
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
                toId,
                targetId: roomId,
                type: NotificationType.invitation,
                isCandidate: true,
                fromName,
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
                toId,
                targetId: roomId,
                type: NotificationType.rejection,
                isCandidate: true,
                fromName,
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
                    aplnt.roomId,
                    aplnt.userId,
                    aplnt.companyName
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
                    aplnt.roomId,
                    aplnt.userId,
                    aplnt.companyName
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
};

export default function Applicants() {
  return (
    <Suspense fallback={<Loading color="gray" />}>
      <ApplicantComponent />
    </Suspense>
  );
}
