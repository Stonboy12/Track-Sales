import { withApi } from "@/server/core/handler";
import { reportController } from "@/server/modules/reports/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  reportController.getById(req, params.id)
);

export const dynamic = "force-dynamic";
