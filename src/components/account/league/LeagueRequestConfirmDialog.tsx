
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LeagueRequest } from "./LeagueRequest";

interface LeagueRequestConfirmDialogProps {
  confirmRequest: { request: LeagueRequest; action: "accept" | "reject" } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function LeagueRequestConfirmDialog({
  confirmRequest,
  onClose,
  onConfirm,
}: LeagueRequestConfirmDialogProps) {
  if (!confirmRequest) return null;

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmRequest.action === "accept" ? "Accept Request" : "Decline Request"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {confirmRequest.action === "accept" ? "accept" : "decline"} this{" "}
            {confirmRequest.request.requestType === "team" ? "team" : "player"} request?
            {confirmRequest.request.requestType === "team" && confirmRequest.action === "accept" && (
              <> The team will be added to the league.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={confirmRequest.action === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {confirmRequest.action === "accept" ? "Accept" : "Decline"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
