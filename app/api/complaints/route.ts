import { withApi } from "@/server/core/handler";
import { complaintController } from "@/server/modules/complaints/controller";

export const GET = withApi((req) => complaintController.list(req));
export const POST = withApi((req) => complaintController.create(req));

export const dynamic = "force-dynamic";
