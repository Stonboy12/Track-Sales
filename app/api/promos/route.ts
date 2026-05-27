import { withApi } from "@/server/core/handler";
import { promoController } from "@/server/modules/promos/controller";

export const GET = withApi((req) => promoController.list(req));
export const POST = withApi((req) => promoController.create(req));

export const dynamic = "force-dynamic";
