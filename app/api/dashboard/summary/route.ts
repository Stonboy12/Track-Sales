import { withApi } from "@/server/core/handler";
import { dashboardController } from "@/server/modules/dashboard/controller";

export const GET = withApi((req) => dashboardController.summary(req));

export const dynamic = "force-dynamic";
