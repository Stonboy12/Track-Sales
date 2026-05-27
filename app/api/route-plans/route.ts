import { withApi } from "@/server/core/handler";
import { routePlanController } from "@/server/modules/route-plans/controller";

export const GET = withApi((req) => routePlanController.list(req));
export const POST = withApi((req) => routePlanController.save(req));

export const dynamic = "force-dynamic";
