import { ArboretumClientConfigFromCdaParamsT } from "@p8marketing/arboretum-sdk";

export const arboretumContentfulConfiguration: ArboretumClientConfigFromCdaParamsT["contentful"]["options"] =
  {
    pageContentTypes: {
      page: {
        slugFieldId: "slug",
        titleFieldId: "name",
        childPagesFieldId: "childPages",
      },
    },
  };
