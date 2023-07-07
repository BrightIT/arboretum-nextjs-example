import gql from "graphql-tag";

export const PageQuery = gql`
  query Page($locale: String!, $preview: Boolean!, $pageId: String!) {
    page(locale: $locale, preview: $preview, id: $pageId) {
      title
      seo {
        title
        description
        keywords
      }
      contentAreaCollection {
        items {
          ... on ComponentText {
            __typename
            title
            text {
              json
            }
          }
        }
      }
    }
  }
`;
