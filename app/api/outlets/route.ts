import { withApi } from "@/server/core/handler";
import { outletController } from "@/server/modules/outlets/controller";

export const GET = withApi((req) => outletController.list(req));
export const POST = withApi((req) => outletController.create(req));

export const dynamic = "force-dynamic";
