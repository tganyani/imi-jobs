"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popoverModal";
import { useState } from "react";

export function DatePicker({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const handleSelect = (date: Date | undefined) => {
    onChange(date); // ←update form field via Controller
    setOpen(false); //  close the popover
  };
  return (
    <Popover open={open} onOpenChange={setOpen} >
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {value ? format(value, "PPP") : <span>pick date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="overflow-y-auto border-0 h-100 py-30 bg-white shadow-lg  rounded-md"
        align="center"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          captionLayout="dropdown"
          initialFocus
          fromYear={1950} // ← minimum year shown
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  );
}
