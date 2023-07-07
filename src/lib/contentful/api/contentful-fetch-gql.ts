import { DocumentNode } from "graphql";
import { print } from "graphql/language/printer";

export type ContentfulConfigT = {
  space: string;
  environment: string;
  accessToken: string;
};

export const contentfulFetchGql =
  (contentfulConfig: ContentfulConfigT) =>
  <Data>(
    query: DocumentNode,
    variables: Record<string, string | boolean | number>
  ): Promise<Data> => {
    return fetch(
      `https://graphql.contentful.com/content/v1/spaces/${contentfulConfig.space}/environments/${contentfulConfig.environment}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contentfulConfig.accessToken}`,
        },
        body: JSON.stringify({ query: print(query), variables }),
      }
    ).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw res;
      }
    });
  };
