import { withApi } from "@/server/core/handler";
import { authController } from "@/server/modules/auth/controller";

export const GET = withApi(() => authController.me());

export const dynamic = "force-dynamic";
