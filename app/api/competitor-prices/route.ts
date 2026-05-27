import { withApi } from "@/server/core/handler";
import { competitorPriceController } from "@/server/modules/competitor-prices/controller";

export const GET = withApi((req) => competitorPriceController.list(req));
export const POST = withApi((req) => competitorPriceController.create(req));

export const dynamic = "force-dynamic";
