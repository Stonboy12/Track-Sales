import { withApi } from "@/server/core/handler";
import { authController } from "@/server/modules/auth/controller";

export const POST = withApi((req) => authController.register(req));

export const dynamic = "force-dynamic";
