"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transferCommitteeOwnership } from "@/app/actions/committee";
import { toast } from "sonner";
import { Crown, ArrowRightLeft } from "lucide-react";

export function TransferOwnershipModal({
  committeeId,
  currentOwnerId,
  members,
}: {
  committeeId: string;
  currentOwnerId: string;
  members: any[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(members[0]?.userId || "");
  const [isPending, setIsPending] = useState(false);

  const handleTransfer = async () => {
    if (!selectedUserId) {
      toast.error("Please select a member to transfer ownership to.");
      return;
    }

    setIsPending(true);
    try {
      const res = await transferCommitteeOwnership(committeeId, selectedUserId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Democratic ownership transferred successfully!");
        setOpen(false);
      }
    } catch {
      toast.error("Failed to transfer ownership.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-amber-500/40 text-amber-800 dark:text-amber-300">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Transfer Committee Leadership
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-600" />
            Democratically Transfer Committee Ownership
          </DialogTitle>
          <DialogDescription className="text-xs">
            Transfer primary managerial ownership of this committee to another active member. You will automatically become a Co-Manager with continued event rights.
          </DialogDescription>
        </DialogHeader>

        {members.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No other members in this committee yet. Add a co-manager or coordinator first to transfer leadership.
          </p>
        ) : (
          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground">Select New Primary Owner / Head Manager:</label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={isPending}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.user.name} ({m.user.email}) &mdash; Currently {m.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          {members.length > 0 && (
            <Button size="sm" className="font-bold text-xs" onClick={handleTransfer} disabled={isPending}>
              {isPending ? "Transferring..." : "Confirm Leadership Transfer"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
