import { ContentfulPage } from "../templates/contentful-page";

export const dynamicParams = true;
export const revalidate = 10;

export default async function Page({
  params,
}: {
  params: { slugs: Array<string> };
}) {
  return <ContentfulPage params={params} mode="published" />;
}
