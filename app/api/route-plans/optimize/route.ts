import { withApi } from "@/server/core/handler";
import { routePlanController } from "@/server/modules/route-plans/controller";

export const POST = withApi((req) => routePlanController.optimize(req));

export const dynamic = "force-dynamic";
