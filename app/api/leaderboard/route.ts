import { withApi } from "@/server/core/handler";
import { leaderboardController } from "@/server/modules/leaderboard/controller";

export const GET = withApi((req) => leaderboardController.list(req));

export const dynamic = "force-dynamic";
