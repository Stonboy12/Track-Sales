import { withApi } from "@/server/core/handler";
import { promoController } from "@/server/modules/promo/controller";

export const POST = withApi((req) => promoController.simulate(req));

export const dynamic = "force-dynamic";
