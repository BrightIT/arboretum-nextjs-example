import { NextApiHandler } from "next";
import { getEnvConfigEff } from "../../lib/config/get-env-config";

const handler: NextApiHandler = (req, res) => {
  const config = getEnvConfigEff(process.env);
  const maybeSlug = req.query?.slug;

  const path = typeof maybeSlug === "string" ? maybeSlug : undefined;

  // Check the secret and next parameters
  // This secret should only be known to this API route and the CMS
  if (req.query.secret !== config.previewSecurityToken || !req.query.slug) {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (!path) {
    return res.status(401).json({ message: "Invalid slug" });
  }

  // Fetch the headless CMS to check if the provided `slug` exists
  // getPostBySlug would implement the required fetching logic to the headless CMS
  //   const post = await getPostBySlug(req.query.slug);

  // If the slug doesn't exist prevent preview mode from being enabled
  //   if (!post) {
  //     return res.status(401).json({ message: "Invalid slug" });
  //   }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({});

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  //   res.redirect(post.slug);

  res.redirect(path);
};

export default handler;
