export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // ClickSend credentials for SMS verification
  clicksendUsername: process.env.CLICKSEND_USERNAME ?? "",
  clicksendApiKey: process.env.CLICKSEND_API_KEY ?? "",
  baseUrl: process.env.BASE_URL ?? "https://3000-idatkfiadpsetlvtwy7fs-a410c665.manus-asia.computer",
};
