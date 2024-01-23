import { ArboretumClientConfigFromCdaParamsT } from "@bright.global/arboretum-sdk";

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
