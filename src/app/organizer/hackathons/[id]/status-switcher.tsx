"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateHackathonStatus } from "@/app/actions/organizer";
import { HackathonStatus } from "@prisma/client";
import { toast } from "sonner";

export function StatusSwitcher({
  hackathonId,
  currentStatus,
}: {
  hackathonId: string;
  currentStatus: HackathonStatus;
}) {
  const [status, setStatus] = useState<HackathonStatus>(currentStatus);
  const [isPending, setIsPending] = useState(false);

  const handleStatusChange = async (newStatus: HackathonStatus) => {
    setIsPending(true);
    try {
      const res = await updateHackathonStatus(hackathonId, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        setStatus(newStatus);
        toast.success(`Hackathon status updated to ${newStatus}!`);
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Stage:</span>
      <Select
        value={status}
        onValueChange={(val) => handleStatusChange(val as HackathonStatus)}
        disabled={isPending}
      >
        <SelectTrigger className="h-9 w-44 text-xs font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={HackathonStatus.DRAFT}>DRAFT</SelectItem>
          <SelectItem value={HackathonStatus.REGISTRATION_OPEN}>REGISTRATION_OPEN</SelectItem>
          <SelectItem value={HackathonStatus.HACKING_LIVE}>HACKING_LIVE</SelectItem>
          <SelectItem value={HackathonStatus.JUDGING}>JUDGING</SelectItem>
          <SelectItem value={HackathonStatus.COMPLETED}>COMPLETED</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
