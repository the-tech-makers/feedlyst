export type IntegrationCapability =
  | "source_discovery"
  | "reviews"
  | "media"
  | "sync";

export type IntegrationAuth = {
  type: "oauth2" | "api_key" | "none";
  scopes?: readonly string[];
};

export type IntegrationDefinition = {
  key: string;
  name: string;
  version: number;
  auth: IntegrationAuth;
  capabilities: readonly IntegrationCapability[];
  discoverSources?: () => Promise<readonly unknown[]>;
  syncSource?: (source: unknown) => Promise<{ created: number; updated: number }>;
};