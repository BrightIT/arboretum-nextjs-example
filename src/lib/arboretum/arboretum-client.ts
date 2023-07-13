import {
  ArboretumClientT,
  createArboretumClientFromCdaParams,
} from "@p8marketing/arboretum-sdk";
import { ArboretumClientParamsT } from "./arboretum-client-params-from-config";

let globalArboretumPublishedClient: ArboretumClientT | undefined = undefined;
let globalArboretumPreviewClient: ArboretumClientT | undefined = undefined;

export const arboretumClientF =
  (revalidationMs?: number) =>
  async (params: ArboretumClientParamsT): Promise<ArboretumClientT> => {
    const { client, warnings } =
      params.preview && globalArboretumPreviewClient
        ? { client: globalArboretumPreviewClient, warnings: undefined }
        : !params.preview && globalArboretumPublishedClient
        ? { client: globalArboretumPublishedClient, warnings: undefined }
        : await createArboretumClientFromCdaParams(params).then((res) => {
            if (params.preview) {
              globalArboretumPreviewClient = res.client;
            } else {
              globalArboretumPublishedClient = res.client;
            }

            console.log(
              `Arboretum ${
                params.preview ? "preview" : "published"
              } client has been created`
            );
            return res;
          });

    if (warnings) {
      console.warn(`Arboretum warnings:\n`);
      warnings.forEach((warning) => {
        console.warn(warning);
      });
    }

    if (
      typeof revalidationMs !== "undefined" &&
      !client.status().regenerationInProgress &&
      new Date().getTime() - new Date(client.status().lastUpdatedAt).getTime() >
        revalidationMs
    ) {
      // Fire and forget
      client.regenerate().then(({ warnings }) => {
        if (warnings) {
          console.warn(`Arboretum warnings:\n`);
          warnings.forEach((warning) => {
            console.warn(warning);
          });
        }
        console.log(
          `Arboretum ${
            params.preview ? "preview" : "published"
          } client has been regenerated`
        );
      });
    }

    return client;
  };
