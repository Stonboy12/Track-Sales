import { withApi } from "@/server/core/handler";
import { activityController } from "@/server/modules/activity/controller";

export const GET = withApi((req) => activityController.list(req));

export const dynamic = "force-dynamic";
