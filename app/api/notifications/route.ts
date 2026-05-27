import { withApi } from "@/server/core/handler";
import { notificationController } from "@/server/modules/notifications/controller";

export const GET = withApi((req) => notificationController.list(req));
export const PATCH = withApi((req) => notificationController.update(req));

export const dynamic = "force-dynamic";
