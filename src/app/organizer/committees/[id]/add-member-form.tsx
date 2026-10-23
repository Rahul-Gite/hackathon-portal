"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addCommitteeMember } from "@/app/actions/committee";
import { CommitteeRole } from "@prisma/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function AddMemberForm({ committeeId }: { committeeId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CommitteeRole>(CommitteeRole.CO_MANAGER);
  const [isPending, setIsPending] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsPending(true);
    try {
      const res = await addCommitteeMember(committeeId, email, role);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Member added with ${role} permissions!`);
        setEmail("");
      }
    } catch {
      toast.error("Failed to add member.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="space-y-3">
      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <UserPlus className="h-3.5 w-3.5 text-primary" />
        Grant Committee Management Access to a Login User
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 space-y-1">
          <Input
            type="email"
            placeholder="Enter user's registered college or personal email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
            className="text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={role}
            onValueChange={(val) => setRole(val as CommitteeRole)}
            disabled={isPending}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CommitteeRole.CO_MANAGER}>Level 2: CO_MANAGER</SelectItem>
              <SelectItem value={CommitteeRole.COORDINATOR}>Level 3: COORDINATOR</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" size="sm" className="font-bold text-xs shrink-0" disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
}
