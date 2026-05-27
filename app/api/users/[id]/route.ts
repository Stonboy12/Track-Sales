import { withApi } from "@/server/core/handler";
import { userController } from "@/server/modules/users/controller";

export const GET = withApi<{ params: { id: string } }>((req, { params }) =>
  userController.getById(req, params.id)
);

export const dynamic = "force-dynamic";
