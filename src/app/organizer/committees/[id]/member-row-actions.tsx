"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateMemberRole, removeCommitteeMember } from "@/app/actions/committee";
import { CommitteeRole } from "@prisma/client";
import { toast } from "sonner";
import { Trash2, ShieldCheck, MoreHorizontal, ShieldAlert } from "lucide-react";

export function MemberRowActions({
  committeeId,
  memberId,
  currentRole,
  isOwner,
  isSelf,
}: {
  committeeId: string;
  memberId: string;
  currentRole: string;
  isOwner: boolean;
  isSelf: boolean;
}) {
  const [isPending, setIsPending] = useState(false);

  if (currentRole === "OWNER") {
    return <span className="text-[10px] text-muted-foreground font-semibold">Primary Head</span>;
  }

  if (!isOwner) {
    return null;
  }

  const handleSetRole = async (targetRole: CommitteeRole) => {
    if (targetRole === currentRole) return;
    setIsPending(true);
    try {
      const res = await updateMemberRole(committeeId, memberId, targetRole);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Role updated to ${targetRole}!`);
      }
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this member from the committee?")) return;
    setIsPending(true);
    try {
      const res = await removeCommitteeMember(committeeId, memberId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Member removed from committee.");
      }
    } catch {
      toast.error("Failed to remove member.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Modify Role</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => handleSetRole(CommitteeRole.CO_MANAGER)}
          className={currentRole === "CO_MANAGER" ? "font-bold text-primary" : ""}
        >
          <ShieldCheck className="h-3.5 w-3.5 mr-2" />
          Level 2: CO_MANAGER
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetRole(CommitteeRole.COORDINATOR)}
          className={currentRole === "COORDINATOR" ? "font-bold text-primary" : ""}
        >
          <ShieldAlert className="h-3.5 w-3.5 mr-2" />
          Level 3: COORDINATOR
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemove} className="text-destructive focus:text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Remove from Committee
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
