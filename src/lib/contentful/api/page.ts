import { PageQuery } from "../gql/queries/page";
import { ContentfulConfigT, contentfulFetchGql } from "./contentful-fetch-gql";
import {
  PageQuery as PageQueryT,
  PageQueryVariables,
} from "../gql/graphql-types";

export const fetchPageData =
  (contentfulConfig: ContentfulConfigT) => (variables: PageQueryVariables) =>
    contentfulFetchGql(contentfulConfig)<{ data: PageQueryT }>(
      PageQuery,
      variables
    ).then((res) => res.data);
