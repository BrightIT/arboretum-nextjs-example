import { ArboretumClientConfigFromCdaParamsT } from "@p8marketing/arboretum-sdk";
import { arboretumContentfulConfiguration } from "../../configuration/arboretum-contentful-configuration";
import { EnvConfigT } from "../config/get-env-config";

export type ArboretumClientParamsT = Pick<
  ArboretumClientConfigFromCdaParamsT,
  "contentful" | "preview" | "options"
>;

export const arboretumClientParamsFromConfig =
  (config: Pick<EnvConfigT, "contentful">) =>
  (preview: boolean): ArboretumClientParamsT => ({
    preview,
    contentful: {
      space: config.contentful.space,
      environment: config.contentful.environment,
      accessToken: preview
        ? config.contentful.cpaAccessToken
        : config.contentful.cdaAccessToken,
      options: arboretumContentfulConfiguration,
    },
  });
