import { withApi } from "@/server/core/handler";
import { outletController } from "@/server/modules/outlets/controller";

export const GET = withApi((req) => outletController.performance(req));

export const dynamic = "force-dynamic";
