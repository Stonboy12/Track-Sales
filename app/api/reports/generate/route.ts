import { withApi } from "@/server/core/handler";
import { reportController } from "@/server/modules/reports/controller";

export const POST = withApi((req) => reportController.generate(req));

export const dynamic = "force-dynamic";
