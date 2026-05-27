import { withApi } from "@/server/core/handler";
import { promoController } from "@/server/modules/promo/controller";

export const POST = withApi((req) => promoController.calculate(req));

export const dynamic = "force-dynamic";
