import { notFound, redirect } from "next/navigation";
import arboretum from "../../lib/arboretum";
import { contentfulConfig } from "../../lib/contentful/contentful-config";
import { fetchPageData } from "../../lib/contentful/api/page";
import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Mode } from "../../lib/types";

const contentfulHost = "https://cdn.contentful.com";

export const ContentfulPage: React.FC<{
  mode: Mode;
  path: string;
}> = async ({ path, mode }) => {
  const { cdaAccessToken, cpaAccessToken, environment, space } =
    contentfulConfig;
  const accessToken = mode === "preview" ? cpaAccessToken : cdaAccessToken;

  const arboretumClient = await arboretum(mode);

  const page = arboretumClient.pageByPath(path, { withChildren: true });

  if (page._tag === "Left") {
    if (path === "/") {
      const defaultLocale = arboretumClient.locales().find((l) => l.default);

      const homePage = defaultLocale
        ? arboretumClient.homePage(defaultLocale.code)
        : { _tag: "Left" as const, left: "Default Locale not found" };
      if (homePage._tag === "Right") {
        redirect(
          `${mode === "preview" ? "/preview" : ""}${homePage.right.path}`
        );
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  } else {
    const data = await fetchPageData({
      space,
      environment,
      accessToken,
    })({
      locale: page.right.localeCode,
      preview: mode === "preview",
      pageId: page.right.type === "page" ? page.right.id : page.right.pageId,
    });

    const renderChildPagesLinks = () => {
      if (page.right.type === "page" && page.right.children) {
        return (
          <div>
            <span>Child pages: </span>
            <ul>
              {page.right.children.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`${mode === "preview" ? "/preview" : ""}${c.path}`}
                  >
                    {c.title || c.path}
                  </Link>
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
      <main className="flex flex-col items-center justify-between p-24">
        {data.page?.contentAreaCollection?.items.map((component) => {
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
        <br />
        {renderChildPagesLinks()}
      </main>
    );
  }
};
