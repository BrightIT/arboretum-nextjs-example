import {
  ArboretumClientT,
  createArboretumClientFromCdaParams,
} from "@bright.global/arboretum-sdk";
import path from "path";
import fs from "fs";
import { ArboretumClientParamsT } from "./arboretum-client-params-from-config";

type ArboretumCachedDataT = ReturnType<ArboretumClientT["cachedData"]>;

type ArboretumCachedDataWithTimestampT = {
  data: ArboretumCachedDataT;
  timestamp: string;
};

const arboretumDataCachePath = (preview: boolean) =>
  path.join(
    __dirname,
    `../../../.cache/arboretum-${preview ? "preview" : "published"}-data.json`
  );

const jsonReviver = (key: any, value: any) => {
  if (value?.__type === "Map") {
    return new Map(Object.entries(value.value));
  }
  return value;
};

const replacer = (key: any, value: any) => {
  if (value instanceof Map) {
    return { __type: "Map", value: Object.fromEntries(value) };
  }
  return value;
};

const cacheArboretumData = async (
  preview: boolean,
  data: ArboretumCachedDataWithTimestampT
): Promise<void> => {
  const path = arboretumDataCachePath(preview);
  console.log(
    `Caching arboretum data (timestamp: ${data.timestamp}, file: ${path})`
  );
  return fs.promises.writeFile(path, JSON.stringify(data, replacer));
};

const cachedArboretumClient = async (
  params: ArboretumClientParamsT
): Promise<{
  client: ArboretumClientT;
  warnings?: Array<string>;
  cacheUpdatedTimestamp: Date;
}> => {
  const cachedData: ArboretumCachedDataWithTimestampT = JSON.parse(
    await fs.promises.readFile(arboretumDataCachePath(params.preview), {
      encoding: "utf-8",
    }),
    jsonReviver
  );

  const { client, warnings } = await createArboretumClientFromCdaParams({
    ...params,
    options: { data: cachedData.data },
  });

  return {
    client,
    warnings,
    cacheUpdatedTimestamp: new Date(cachedData.timestamp),
  };
};

const createAndCacheArboretumClient = async (
  params: ArboretumClientParamsT
): Promise<{ client: ArboretumClientT; warnings?: Array<string> }> => {
  const timestamp = new Date();
  const res = await createArboretumClientFromCdaParams({
    ...params,
    options: { ...params.options, eagerly: true },
  });

  await cacheArboretumData(params.preview, {
    data: res.client.cachedData(),
    timestamp: timestamp.toISOString(),
  });

  return res;
};

let regenerationInProgress = false;

export const cachedArboretumClientF =
  (revalidationMs?: number) =>
  async (params: ArboretumClientParamsT): Promise<ArboretumClientT> => {
    const {
      client,
      warnings,
      cacheUpdatedTimestamp,
    }: {
      client: ArboretumClientT;
      warnings?: Array<string>;
      cacheUpdatedTimestamp?: Date;
    } = await cachedArboretumClient(params).catch((_) =>
      createAndCacheArboretumClient(params).then((res) => {
        console.log(
          `Arboretum ${
            params.preview ? "preview" : "published"
          } client has been created`
        );
        return res;
      })
    );

    if (warnings) {
      console.warn(`Arboretum warnings:\n`);
      warnings.forEach((warning) => {
        console.warn(warning);
      });
    }

    if (
      !regenerationInProgress &&
      cacheUpdatedTimestamp &&
      typeof revalidationMs !== "undefined" &&
      new Date().getTime() - cacheUpdatedTimestamp.getTime() > revalidationMs
    ) {
      regenerationInProgress = true;
      // Fire and forget
      createAndCacheArboretumClient(params).finally(() => {
        regenerationInProgress = false;
        console.log(
          `Arboretum ${
            params.preview ? "preview" : "published"
          } client has been regenerated`
        );
      });
    }

    return client;
  };
