import { withApi } from "@/server/core/handler";
import { complaintController } from "@/server/modules/complaints/controller";

export const POST = withApi<{ params: { id: string } }>((req, { params }) =>
  complaintController.appendTimeline(req, params.id)
);

export const dynamic = "force-dynamic";
