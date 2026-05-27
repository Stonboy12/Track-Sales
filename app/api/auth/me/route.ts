import { withApi } from "@/server/core/handler";
import { authController } from "@/server/modules/auth/controller";

export const GET = withApi((req) => authController.me(req));

export const dynamic = "force-dynamic";
