import { GetServerSideProps } from "next";
import { ArboretumPageNodeT } from "@p8marketing/arboretum-sdk";
import { getEnvConfigEff } from "../lib/config/get-env-config";
import { cachedArboretumClientF } from "../lib/arboretum/cached-arboretum-client";
import { arboretumClientParamsFromConfig } from "../lib/arboretum/arboretum-client-params-from-config";
import { fetchPageData } from "../lib/contentful/api/page";
import { PageQuery } from "../lib/contentful/gql/graphql-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Link from "next/link";
import { arboretumClientF } from "../lib/arboretum/arboretum-client";

type PagePropsT = { page: ArboretumPageNodeT; data: PageQuery };

export default function Page(props: PagePropsT) {
  const renderChildPagesLinks = () => {
    if (props.page.type === "page" && props.page.children) {
      return (
        <div>
          <span>Child pages: </span>
          <ul>
            {props.page.children.map((c) => (
              <li key={c.id}>
                <Link href={c.path}>{c.title || c.path}</Link>
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      {props.data.page?.contentAreaCollection?.items.map((component) => {
        switch (component?.__typename) {
          case "ComponentText": {
            return documentToReactComponents(component.text?.json);
          }
          case null:
          case undefined: {
            return null;
          }
          default: {
            throw new Error(`Unhandled component: ${component?.__typename}`);
          }
        }
      })}
      {renderChildPagesLinks()}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  resolvedUrl,
  preview,
}) => {
  const config = getEnvConfigEff(process.env);
  const params = arboretumClientParamsFromConfig(config)(!!preview);

  const client = config.dev
    ? await cachedArboretumClientF(config.arboretumRevalidationMs)(params)
    : await arboretumClientF(config.arboretumRevalidationMs)(params);

  const pageE = client.pageByPath(resolvedUrl, { withChildren: true });

  if (pageE._tag === "Left") {
    console.log(
      `Failed to get page by path: ${resolvedUrl}, preview: ${!!preview} (details: ${
        pageE.left
      })`
    );
    return {
      notFound: true,
    };
  }

  const data = await fetchPageData({
    space: config.contentful.space,
    environment: config.contentful.environment,
    accessToken: preview
      ? config.contentful.cpaAccessToken
      : config.contentful.cdaAccessToken,
  })({
    locale: pageE.right.localeCode,
    preview: !!preview,
    pageId: pageE.right.type === "page" ? pageE.right.id : pageE.right.pageId,
  });

  const props: PagePropsT = {
    page: pageE.right,
    data: data,
  };

  return {
    // https://github.com/vercel/next.js/discussions/11209#discussioncomment-35915
    props: JSON.parse(JSON.stringify(props)),
  };
};
