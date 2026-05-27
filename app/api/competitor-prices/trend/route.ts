import { withApi } from "@/server/core/handler";
import { competitorPriceController } from "@/server/modules/competitor-prices/controller";

export const GET = withApi((req) => competitorPriceController.trend(req));

export const dynamic = "force-dynamic";
