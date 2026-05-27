import { withApi } from "@/server/core/handler";
import { productController } from "@/server/modules/products/controller";

export const GET = withApi((req) => productController.list(req));
export const POST = withApi((req) => productController.create(req));

export const dynamic = "force-dynamic";
