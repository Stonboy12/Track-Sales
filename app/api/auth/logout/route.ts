import { withApi } from "@/server/core/handler";
import { authController } from "@/server/modules/auth/controller";

export const POST = withApi(() => authController.logout());

export const dynamic = "force-dynamic";
