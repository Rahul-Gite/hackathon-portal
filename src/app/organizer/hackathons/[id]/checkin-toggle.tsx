"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleCheckIn } from "@/app/actions/organizer";
import { toast } from "sonner";
import { Check, UserCheck, X } from "lucide-react";

export function CheckInToggle({
  registrationId,
  initialStatus,
}: {
  registrationId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    try {
      const res = await toggleCheckIn(registrationId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.newStatus) {
        setStatus(res.newStatus);
        toast.success(
          res.newStatus === "CHECKED_IN"
            ? "Student checked in!"
            : "Check-in revoked."
        );
      }
    } catch {
      toast.error("Failed to toggle check-in.");
    } finally {
      setIsPending(false);
    }
  };

  const isCheckedIn = status === "CHECKED_IN";

  return (
    <Button
      size="sm"
      variant={isCheckedIn ? "outline" : "default"}
      className="h-7 px-2.5 text-xs font-semibold gap-1"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isCheckedIn ? (
        <>
          <X className="h-3 w-3 text-destructive" />
          Revoke
        </>
      ) : (
        <>
          <Check className="h-3 w-3" />
          Check In
        </>
      )}
    </Button>
  );
}
