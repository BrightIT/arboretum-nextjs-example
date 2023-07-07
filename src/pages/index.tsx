import { GetStaticProps } from "next";
import { arboretumClientParamsFromConfig } from "../lib/arboretum/arboretum-client-params-from-config";
import {
  cachedArboretumClient,
  createAndCacheArboretumClient,
} from "../lib/arboretum/cached-arboretum-client";
import { getEnvConfigEff } from "../lib/config/get-env-config";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home(props: { redirectTo: string }) {
  const router = useRouter();

  useEffect(() => {
    router.push(props.redirectTo);
  });
  return null;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const config = getEnvConfigEff(process.env);
  const params = arboretumClientParamsFromConfig(config)(!!context.preview);
  const { client: arboretumClient } = await cachedArboretumClient(params).catch(
    (_) => createAndCacheArboretumClient(params)
  );

  const defaultLocale = arboretumClient.locales().find((l) => l.default);

  const homePages = defaultLocale
    ? arboretumClient.pagesByTagId(defaultLocale.code, "pageHome")
    : { _tag: "Left" as const, left: "Default Locale not found" };

  if (homePages._tag === "Right") {
    if (homePages.right.length > 0) {
      const [homePage] = homePages.right;
      return {
        props: { redirectTo: homePage.path },
      };
    } else {
      throw new Error(`Home page not found`);
    }
  } else {
    throw new Error(homePages.left);
  }
};
