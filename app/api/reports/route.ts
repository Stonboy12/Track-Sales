import { withApi } from "@/server/core/handler";
import { reportController } from "@/server/modules/reports/controller";

export const GET = withApi((req) => reportController.list(req));
export const POST = withApi((req) => reportController.save(req));

export const dynamic = "force-dynamic";
