import { GetStaticProps } from "next";
import { arboretumClientParamsFromConfig } from "../lib/arboretum/arboretum-client-params-from-config";
import { cachedArboretumClientF } from "../lib/arboretum/cached-arboretum-client";
import { getEnvConfigEff } from "../lib/config/get-env-config";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { arboretumClientF } from "../lib/arboretum/arboretum-client";

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
  const client = config.dev
    ? await cachedArboretumClientF(config.arboretumRevalidationMs)(params)
    : await arboretumClientF(config.arboretumRevalidationMs)(params);

  const defaultLocale = client.locales().find((l) => l.default);

  const homePage = defaultLocale
    ? client.homePage(defaultLocale.code)
    : { _tag: "Left" as const, left: "Default Locale not found" };

  if (homePage._tag === "Right") {
    return {
      props: { redirectTo: homePage.right.path },
    };
  } else {
    throw new Error(homePage.left);
  }
};
