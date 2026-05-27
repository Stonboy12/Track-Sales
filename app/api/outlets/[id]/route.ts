import { withApi } from "@/server/core/handler";
import { outletController } from "@/server/modules/outlets/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  outletController.getById(req, params.id)
);

export const PATCH = withApi<{ params: { id: string } }>((req, { params }) =>
  outletController.update(req, params.id)
);

export const DELETE = withApi<{ params: { id: string } }>((req, { params }) =>
  outletController.remove(req, params.id)
);

export const dynamic = "force-dynamic";
