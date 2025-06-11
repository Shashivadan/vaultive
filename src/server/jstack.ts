import { InferMiddlewareOutput, jstack } from "jstack";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "hono/adapter";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { HTTPException } from "hono/http-exception";

interface Env {
  Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

/**
 * Type-safely injects database into all procedures
 * @see https://jstack.app/docs/backend/middleware
 *
 * For deployment to Cloudflare Workers
 * @see https://developers.cloudflare.com/workers/tutorials/postgres/
 */

const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL } = env(c);
  const db = drizzle(DATABASE_URL);
  return await next({ db });
});

const authMiddleware = j.middleware(async ({ c, ctx, next }) => {
  const { db } = ctx as InferMiddlewareOutput<typeof databaseMiddleware>;
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg", // or "mysql", "sqlite"
    }),
  });
  return await next({ auth });
});

const authenticationMiddleware = j.middleware(async ({ c, ctx, next }) => {
  const { auth } = ctx as InferMiddlewareOutput<typeof authMiddleware>;
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new HTTPException(401, {
      message: "Unauthenticated, sign in to continue.",
    });
  }
  return await next({ session });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure
  .use(databaseMiddleware)
  .use(authMiddleware);

export const protectedProcedure = publicProcedure.use(authenticationMiddleware);
