export type EnvConfigT = {
  dev: boolean;
  previewSecurityToken?: string;
  contentful: {
    space: string;
    environment: string;
    cdaAccessToken: string;
    cpaAccessToken: string;
  };
};

export const getEnvConfigEff = (env: NodeJS.Process["env"]): EnvConfigT => {
  const dev = process.env.NODE_ENV === "development";
  const spaceEnv = "CONTENTFUL_SPACE";
  const environmentEnv = "CONTENTFUL_ENVIRONMENT";
  const cdaAccessTokenEnv = "CONTENTFUL_CDA_ACCESS_TOKEN";
  const cpaAccessTokenEnv = "CONTENTFUL_CPA_ACCESS_TOKEN";
  const space = env?.[spaceEnv];
  const environment = env?.[environmentEnv];
  const cdaAccessToken = env?.[cdaAccessTokenEnv];
  const cpaAccessToken = env?.[cpaAccessTokenEnv];
  const previewSecurityToken = env?.["PREVIEW_SECURITY_TOKEN"];

  const envErr = (env: string) =>
    new Error(`Environment variable ${env} is not defined`);

  if (!space) {
    throw envErr(spaceEnv);
  } else if (!environment) {
    throw envErr(environmentEnv);
  } else if (!cdaAccessToken) {
    throw envErr(cdaAccessTokenEnv);
  } else if (!cpaAccessToken) {
    throw envErr(cpaAccessTokenEnv);
  } else {
    return {
      dev,
      previewSecurityToken,
      contentful: {
        space,
        environment,
        cdaAccessToken,
        cpaAccessToken,
      },
    };
  }
};
