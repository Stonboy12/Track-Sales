import { withApi } from "@/server/core/handler";
import { visitController } from "@/server/modules/visits/controller";

export const GET = withApi((req) => visitController.list(req));
export const POST = withApi((req) => visitController.create(req));

export const dynamic = "force-dynamic";
