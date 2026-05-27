import { withApi } from "@/server/core/handler";
import { complaintController } from "@/server/modules/complaints/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  complaintController.getById(req, params.id)
);
export const PATCH = withApi<{ params: { id: string } }>((req, { params }) =>
  complaintController.update(req, params.id)
);

export const dynamic = "force-dynamic";
