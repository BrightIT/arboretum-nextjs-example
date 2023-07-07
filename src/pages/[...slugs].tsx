import { GetStaticProps, GetStaticPaths } from "next";
import { ArboretumPageNodeT } from "@p8marketing/arboretum-sdk";
import { getEnvConfigEff } from "../lib/config/get-env-config";
import {
  cachedArboretumClient,
  createAndCacheArboretumClient,
} from "../lib/arboretum/cached-arboretum-client";
import { arboretumClientParamsFromConfig } from "../lib/arboretum/arboretum-client-params-from-config";
import { fetchPageData } from "../lib/contentful/api/page";
import { PageQuery } from "../lib/contentful/gql/graphql-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Link from "next/link";

type PagePropsT = { page: ArboretumPageNodeT; data: PageQuery };

const preview: boolean = false;

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

export const getStaticProps: GetStaticProps = async (context) => {
  const config = getEnvConfigEff(process.env);
  const params = arboretumClientParamsFromConfig(config);

  const maybeSlugs = context.params?.slugs;
  const slugs =
    typeof maybeSlugs !== "undefined"
      ? Array.isArray(maybeSlugs)
        ? maybeSlugs
        : [maybeSlugs]
      : undefined;
  const path = slugs && slugs?.length > 0 ? "/" + slugs.join("/") : undefined;
  const { client, warnings } = await cachedArboretumClient(
    params(!!context.preview)
  );

  if (warnings) {
    console.warn(`Arboretum warnings:\n`);
    warnings.forEach((warning) => {
      console.warn(warning);
    });
  }

  if (!path) {
    throw new Error(`Path not defined`);
  }

  const pageE = client.pageByPath(path, { withChildren: true });

  if (pageE._tag === "Left") {
    throw new Error(pageE.left);
  }

  const data = await fetchPageData({
    space: config.contentful.space,
    environment: config.contentful.environment,
    accessToken: context.preview
      ? config.contentful.cpaAccessToken
      : config.contentful.cdaAccessToken,
  })({
    locale: pageE.right.localeCode,
    preview: !!context.preview,
    pageId: pageE.right.id,
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

export const getStaticPaths: GetStaticPaths = async () => {
  const config = getEnvConfigEff(process.env);
  // TODO: Handle contentful preview mode
  const params = arboretumClientParamsFromConfig(config)(false);

  const createArboretumClientEff = () => createAndCacheArboretumClient(params);

  const { client: arboretumClient, warnings } = await (config.dev
    ? cachedArboretumClient(params).catch((_) => createArboretumClientEff())
    : createArboretumClientEff());

  if (warnings) {
    console.warn(`Arboretum warnings:\n`);
    warnings.forEach((warning) => {
      console.warn(warning);
    });
  }

  const pages = arboretumClient.pages();

  if (pages._tag === "Right") {
    return {
      fallback: false,
      paths: pages.right.map(({ path }) => path),
    };
  } else {
    throw new Error(`Failed to get arboretum pages (details: ${pages.left})`);
  }
};
