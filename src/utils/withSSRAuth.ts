import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSTAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if(!cookies['nextAuth.token']) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        }
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if(error instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextAuth.token')
        destroyCookie(ctx, 'nextAuth.refreshToken')

        return {
          redirect: {
            destination: "/",
            permanent: false,
          }
        }
      }
    }
  }
}
