import { withApi } from "@/server/core/handler";
import { productController } from "@/server/modules/products/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  productController.getById(req, params.id)
);
export const PATCH = withApi<{ params: { id: string } }>((req, { params }) =>
  productController.update(req, params.id)
);

export const dynamic = "force-dynamic";
