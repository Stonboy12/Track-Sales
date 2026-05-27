import { withApi } from "@/server/core/handler";
import { settingsController } from "@/server/modules/settings/controller";

export const GET = withApi((req) => settingsController.get(req));
export const PATCH = withApi((req) => settingsController.update(req));

export const dynamic = "force-dynamic";
