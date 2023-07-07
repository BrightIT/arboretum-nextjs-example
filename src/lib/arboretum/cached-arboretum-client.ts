import {
  ArboretumClientConfigFromCdaParamsT,
  ArboretumClientT,
  createArboretumClientFromCdaParams,
} from "@p8marketing/arboretum-sdk";
import path from "path";
import fs from "fs";
import { ArboretumClientParamsT } from "./arboretum-client-params-from-config";

type ArboretumCachedDataT = ReturnType<ArboretumClientT["cachedData"]>;

const arboretumDataCachePath = path.join(
  __dirname,
  "../../../.cache/arboretum-data.json"
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

const cacheArboretumData = async (data: ArboretumCachedDataT): Promise<void> =>
  fs.promises.writeFile(arboretumDataCachePath, JSON.stringify(data, replacer));

export const cachedArboretumClient = async (
  params: ArboretumClientParamsT
): Promise<{ client: ArboretumClientT; warnings?: Array<string> }> => {
  const cachedData: ArboretumCachedDataT = JSON.parse(
    await fs.promises.readFile(arboretumDataCachePath, { encoding: "utf-8" }),
    jsonReviver
  );

  return createArboretumClientFromCdaParams({
    ...params,
    options: { data: cachedData },
  });
};

export const createAndCacheArboretumClient = async (
  params: ArboretumClientParamsT
): Promise<{ client: ArboretumClientT; warnings?: Array<string> }> => {
  const res = await createArboretumClientFromCdaParams({
    ...params,
    options: { ...params.options, eagerly: true },
  });

  await cacheArboretumData(res.client.cachedData());

  return res;
};
