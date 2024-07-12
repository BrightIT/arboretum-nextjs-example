import { ContentfulPage } from "../templates/contentful-page";

export const dynamicParams = true;
export const revalidate = 30;

export default async function Page({
  params,
}: {
  params: { slugs: Array<string> };
}) {
  const path = `/${(params.slugs || [])?.join("/")}`;
  return <ContentfulPage path={path} mode="published" />;
}
