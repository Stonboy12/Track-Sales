import { withApi } from "@/server/core/handler";
import { userController } from "@/server/modules/users/controller";

export const GET = withApi((req) => userController.list(req));

export const dynamic = "force-dynamic";
