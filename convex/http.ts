import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      switch (result.type) {
        case "user.created":
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: `https://winning-sculpin-54.clerk.accounts.dev|${result.data.id}`,
            name: `${result.data.first_name ?? ""} ${
              result.data.last_name ?? ""
            }`,
            image: result.data.image_url,
          });
          break;
        case "user.updated":
          await ctx.runMutation(internal.users.updateUser, {
            tokenIdentifier: `https://winning-sculpin-54.clerk.accounts.dev|${result.data.id}`,
            name: `${result.data.first_name ?? ""} ${
              result.data.last_name ?? ""
            }`,
            image: result.data.image_url,
          });
          break;
      }

      return new Response(null, {
        status: 200,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;