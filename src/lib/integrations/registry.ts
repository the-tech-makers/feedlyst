import type { IntegrationDefinition } from "@/lib/integrations/types";

const definitions = new Map<string, IntegrationDefinition>();

export function registerIntegration(definition: IntegrationDefinition) {
  const key = definition.key.trim();

  if (!key) throw new Error("Integration key is required");
  if (definitions.has(key)) throw new Error(`Integration already registered: ${key}`);
  if (!definition.name.trim()) throw new Error(`Integration name is required: ${key}`);
  if (!Number.isInteger(definition.version) || definition.version < 1) {
    throw new Error(`Integration version must be a positive integer: ${key}`);
  }

  definitions.set(key, { ...definition, key });
  return definition;
}

export function getIntegration(key: string) {
  return definitions.get(key);
}

export function listIntegrations() {
  return [...definitions.values()];
}

export function requireIntegration(key: string) {
  const integration = getIntegration(key);
  if (!integration) throw new Error(`Integration not registered: ${key}`);
  return integration;
}