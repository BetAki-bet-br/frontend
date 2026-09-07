import { environment } from '@env/environment';

/**
 * A brand value that differs between the environments the brand is built for.
 *
 * Brand packages declare the variants side by side and resolve them with {@link brandEnv}, so a
 * single `brands/<slug>/brand.config.ts` covers every environment. `demo` is optional: a value
 * that does not change for the published demo simply leaves it out and gets `prod`.
 */
export interface BrandEnvValue<T> {
  dev: T;
  prod: T;
  /** The published demo (`environment.demo.ts`). Falls back to {@link prod}. */
  demo?: T;
}

/** Resolves a per-environment brand value against the environment the app was built for. */
export function brandEnv<T>(value: BrandEnvValue<T>): T {
  if (environment.showcase) return value.demo ?? value.prod;
  return environment.production ? value.prod : value.dev;
}
