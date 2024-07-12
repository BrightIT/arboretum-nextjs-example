import {
  ArboretumClientConfigFromCdaParamsT,
  ArboretumClientT,
  createArboretumClientFromCdaParams,
} from "@bright.global/arboretum-sdk";
import { contentfulConfig } from "./contentful/contentful-config";
import { Mode } from "./types";

const arboretumConfig = (
  mode: Mode
): Pick<
  ArboretumClientConfigFromCdaParamsT,
  "contentful" | "preview" | "options"
> => ({
  preview: mode === "preview",
  // options: { eagerly: true },
  contentful: {
    ...contentfulConfig,
    accessToken:
      mode === "preview"
        ? contentfulConfig.cpaAccessToken
        : contentfulConfig.cdaAccessToken,
    options: {
      pageContentTypes: {
        page: {
          slugFieldId: "slug",
          titleFieldId: "title",
          childPagesFieldId: "childPages",
        },
      },
    },
  },
});

const arboretumClientSingleton = async (mode: Mode) => {
  const c = await createArboretumClientFromCdaParams(arboretumConfig(mode));
  console.log(`Arboretum ${mode} instance created`);
  return c;
};

type GlobalArboretum = {
  client: ArboretumClientT;
  lastRegeneration: Date;
  regenerationInProgress: boolean;
};

declare const globalThis: {
  publishedArboretum: GlobalArboretum;
  previewArboretum: GlobalArboretum;
} & typeof global;

type ArboretumInstance = keyof Pick<
  typeof globalThis,
  "publishedArboretum" | "previewArboretum"
>;

const getArboretumRevalidateEnv = (mode: Mode) => {
  const env =
    mode === "preview"
      ? process.env.ARBORETUM_PREVIEW_REVALIDATE
      : process.env.ARBORETUM_PUBLISHED_REVALIDATE;
  const revalidateSec = env ? Number(env) : NaN;

  return isNaN(revalidateSec) ? undefined : revalidateSec;
};

const arboretumShouldRegenerate = (mode: Mode): boolean => {
  const revalidateSec = getArboretumRevalidateEnv(mode);
  const instance: ArboretumInstance =
    mode === "preview" ? "previewArboretum" : "publishedArboretum";

  return (
    typeof revalidateSec !== "undefined" &&
    !globalThis[instance].regenerationInProgress &&
    globalThis[instance].lastRegeneration &&
    new Date().getTime() - globalThis[instance].lastRegeneration.getTime() >
      revalidateSec * 1000
  );
};

const arboretum = async (mode: Mode) => {
  const instance: ArboretumInstance =
    mode === "preview" ? "previewArboretum" : "publishedArboretum";
  if (globalThis?.[instance]?.client) {
    if (arboretumShouldRegenerate(mode)) {
      console.log(`Arboretum ${mode} regeneration started`);
      globalThis[instance].regenerationInProgress = true;
      // fire and forget
      globalThis[instance].client
        .regenerate()
        .then(({ warnings }) => {
          console.log(`Arboretum ${mode} regeneration finished`);
          if (warnings) {
            console.warn(`Arboretum ${mode} warnings:`);
            console.warn(warnings);
          }
          globalThis[instance] = {
            ...globalThis[instance],
            lastRegeneration: new Date(),
          };
        })
        .catch((err) => {
          console.log(`Arboretum ${mode} regeneration failed`);
          console.error(err);
        })
        .finally(() => {
          globalThis[instance].regenerationInProgress = false;
        });
    }
    return Promise.resolve(globalThis[instance].client);
  } else {
    const { client, warnings } = await arboretumClientSingleton(mode);
    if (warnings) {
      console.warn(`Arboretum ${mode} warnings:`);
      console.warn(warnings);
    }
    globalThis[instance] = {
      client: client,
      lastRegeneration: new Date(),
      regenerationInProgress: false,
    };
    return client;
  }
};

export default arboretum;
