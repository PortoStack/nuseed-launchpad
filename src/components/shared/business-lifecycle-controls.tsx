"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type LifecycleProps = {
  kind: string;
  onChanged: () => void | Promise<void>;
};

export function BusinessDeleteButton({
  id,
  label,
  onChanged,
}: LifecycleProps & { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    setPending(true);
    try {
      await onChanged();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`ลบ ${label}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
      {open && (
        <Dialog open onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการลบรายการ</DialogTitle>
              <DialogDescription>
                คุณแน่ใจหรือไม่ว่าต้องการลบ &ldquo;{label}&rdquo;
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={handleDelete}
              >
                {pending ? "กำลังลบ..." : "ลบรายการ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function BusinessTrashButton({ onChanged }: LifecycleProps) {
  return null;
}
