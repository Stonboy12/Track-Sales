import { withApi } from "@/server/core/handler";
import { visitController } from "@/server/modules/visits/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  visitController.getById(req, params.id)
);
export const PATCH = withApi<{ params: { id: string } }>((req, { params }) =>
  visitController.update(req, params.id)
);

export const dynamic = "force-dynamic";
