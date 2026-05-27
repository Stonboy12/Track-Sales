import { withApi } from "@/server/core/handler";
import { promoController } from "@/server/modules/promos/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  promoController.getById(req, params.id)
);
export const PATCH = withApi<{ params: { id: string } }>((req, { params }) =>
  promoController.update(req, params.id)
);
export const DELETE = withApi<{ params: { id: string } }>((req, { params }) =>
  promoController.remove(req, params.id)
);

export const dynamic = "force-dynamic";
