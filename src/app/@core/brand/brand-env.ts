import { environment } from '@env/environment';

/**
 * A brand value that differs between the development and the production environment.
 *
 * Brand packages declare the two variants side by side and resolve them with {@link brandEnv},
 * so a single `brands/<slug>/brand.config.ts` covers every environment the brand is deployed to.
 */
export interface BrandEnvValue<T> {
  dev: T;
  prod: T;
}

/** Resolves a per-environment brand value against the environment the app was built for. */
export function brandEnv<T>(value: BrandEnvValue<T>): T {
  return environment.production ? value.prod : value.dev;
}
