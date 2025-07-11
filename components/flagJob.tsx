"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Flag } from "lucide-react";

const flagOptions: { id: number; text: string }[] = [
  {
    id: 1,
    text: "Vague Description",
  },
  {
    id: 2,
    text: "Just not interested",
  },
  {
    id: 3,
    text: "Job posted too long ago",
  },
  {
    id: 4,
    text: "Too Many Applicants",
  },
  {
    id: 5,
    text: "Job not related to my field",
  },
];

export default function FlagJob() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="w-60 [@media(max-width:480px)]:w-full">
        <Button
          variant="secondary"
          size="sm"
          className=" text-[var(--mygreen)] "
        >
          <Flag className="text-[var(--mygreen)]" />
          Inappropriate
        </Button>
      </DialogTrigger>
      <DialogContent className="border-none">
        <DialogHeader>
          <DialogTitle className="text-start">
            Is the job inappropriate ?
          </DialogTitle>
          <DialogDescription className="text-start">
            This helps the system direct best jobs for you
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          value={value}
          onValueChange={(val) => {
            setValue(val);
          }}
        >
          {flagOptions.map((opt) => (
            <div key={opt.id} className="flex flex-nowrap gap-x-8">
              <RadioGroupItem value={opt.text} />
              <p className="text-sm">{opt.text}</p>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button
            onClick={() => {
              setOpen(false);

              toast("Job successfully flaged", {
                description: "The system will not show you  this type of jobs",
                action: (
                  <Button
                  size="sm"
                    onClick={() => console.log("Undo")}
                    className="px-3 rounded-md bg-[var(--mygreen)] text-white text-sm hover:bg-green-600 transition"
                  >
                    undo
                  </Button>
                ),
              });
            }}
            disabled={!value}
            className="bg-[var(--mygreen)] text-white w-60 [@media(max-width:480px)]:w-full"
          >
            submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
