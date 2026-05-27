import { withApi } from "@/server/core/handler";
import { visitController } from "@/server/modules/visits/controller";

export const GET = withApi<{ params: { outletId: string } }>((req, { params }) =>
  visitController.byOutlet(req, params.outletId)
);

export const dynamic = "force-dynamic";
