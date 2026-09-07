/**
 * The vocabulary the application uses to talk about what the operator publishes: the banners, the
 * templates that render them, the terms, and the reference lists a form has to offer.
 *
 * Nothing here comes from a vendor SDK on purpose. These are the types `CmsService`,
 * `TemplateService`, `HelpService` and `ConfigurationService` work with, and every adapter under
 * `adapters/` translates its own provider's payloads into them.
 *
 * The lobby's rows and artwork are **not** here: those come from our own backoffice and never
 * crossed a gateway. What this port covers is the content the *portal* holds, which is a different
 * pile with a different owner, and the one the app still had to ask a vendor for.
 */

/**
 * One banner the operator placed in a slot.
 *
 * A banner is a template plus the values for its fields: the app looks up {@link templateId} in
 * {@link CmsTemplate}, then renders that HTML with {@link content}.
 */
export interface CmsBanner {
  /** The operator's name for it, shown where a title is needed. */
  name: string;
  /** Where it sits in its slot, lowest first. */
  position: number;
  /** Which {@link CmsTemplate} renders it. */
  templateId: number;
  /**
   * The template's fields, already flattened: field name to value.
   *
   * An image field arrives as the url of the file, a checkbox as a boolean, everything else as the
   * string the operator typed. How a provider spells that out is the adapter's problem.
   */
  content: Record<string, string | boolean>;
  /**
   * ISO timestamp the operator stops showing it. Absent when it has no end.
   *
   * The promotions page counts down to it.
   */
  endsAt?: string;
}

/** One HTML template, with `{{ Field name }}` placeholders `RenderTemplatePipe` fills in. */
export interface CmsTemplate {
  id: number;
  html: string;
}

/** A country the operator will accept an address in. */
export interface Country {
  /** Alpha-2, ISO 3166-1. */
  code: string;
  name: string;
}
