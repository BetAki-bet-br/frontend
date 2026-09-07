import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { DataStoreService } from '@app/@core/data-store.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { I18nService } from '@app/i18n';
import { environment } from '@env/environment';
import {
  BannerService,
  ContentData,
  ContentFieldValue,
  GlobalizationService,
  TemplateService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, map, of } from 'rxjs';
import { ContentGateway } from '../content.gateway';
import { CmsBanner, CmsTemplate, Country } from '../content.models';
import { TEMPLATES } from '../dev-templates';

/**
 * `ContentGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file in the application allowed to know that a banner arrives as a bag of typed
 * field values, that there are two banner endpoints (one of which personalises for the signed-in
 * player), that the terms come wrapped in a versioned envelope, and that the country list has a
 * row called `Unknown` in it.
 */
@Injectable()
export class ComtradeContentGateway implements ContentGateway {
  private readonly bannerApi = inject(BannerService);
  private readonly templateApi = inject(TemplateService);
  private readonly globalizationApi = inject(GlobalizationService);
  private readonly credentials = inject(CredentialsService);
  private readonly dataStore = inject(DataStoreService);
  private readonly i18n = inject(I18nService);
  private readonly brand = inject(BRAND);

  /** The language the content is asked for, falling back to the brand's default. */
  private get language(): string {
    return this.i18n.language ?? this.dataStore.defaultLanguage;
  }

  /**
   * The gateway keeps two banner endpoints: one for anybody, and one that personalises for the
   * player holding the session. Which of them answers is not something a screen should have to
   * decide, so it is decided here, once.
   */
  getBanners(slugs: string[]): Observable<CmsBanner[]> {
    const portalId = this.dataStore.defaultPortalId;

    const banners$ = this.credentials.isAuthenticated()
      ? this.bannerApi.apiPortalV1CmsPlayerBannersGet(slugs, portalId, this.language)
      : this.bannerApi.apiPortalV1CmsBannersGet(slugs, portalId, this.language);

    return banners$.pipe(map((banners) => (banners ?? []).filter((banner) => banner != null).map(toBanner)));
  }

  getTemplates(): Observable<CmsTemplate[]> {
    // Local templates are how the CMS markup is edited without a CMS to edit it in.
    if (environment.useLocalHtmlTemplates) return of(TEMPLATES);

    return this.templateApi
      .apiPortalV1CmsTemplatesGet(this.brand.ids.brandId)
      .pipe(
        map((templates) =>
          (templates ?? []).map((template) => ({ id: template.id ?? 0, html: template.htmlDefinition ?? '' })),
        ),
      );
  }

  getTermsAndConditions(): Observable<string> {
    return this.templateApi
      .apiPortalV1TemplateTermsAndConditionsGet(this.dataStore.defaultPortalId, this.i18n.language)
      .pipe(map((response) => response?.termsAndConditionsContent ?? ''));
  }

  getCountries(): Observable<Country[]> {
    return this.globalizationApi.apiPortalV1GlobalizationCountriesGet(this.dataStore.defaultPortalId).pipe(
      map((countries) =>
        (countries ?? [])
          // The gateway's own placeholder row. Nothing downstream wants to offer it.
          .filter((country) => country.name !== 'Unknown')
          .map((country) => ({ code: country.code ?? '', name: country.name ?? '' })),
      ),
    );
  }
}

function toBanner(banner: ContentData): CmsBanner {
  return {
    name: banner.name ?? '',
    position: banner.position ?? Number.MAX_SAFE_INTEGER,
    templateId: banner.templateId ?? 0,
    content: flattenFields(banner.contentFieldValues ?? undefined),
    endsAt: banner.contentSchedule?.endDate ?? undefined,
  };
}

/**
 * Turns the gateway's field-value bag into the plain map a template is rendered with.
 *
 * The provider sends every value as a string plus the name of its field type; an image also
 * carries the file it points at. Exported because the bonus adapter renders the same kind of
 * template from the same kind of bag.
 */
export function flattenFields(values: ContentFieldValue[] | undefined): Record<string, string | boolean> {
  const content: Record<string, string | boolean> = {};

  for (const value of values ?? []) {
    const key = value?.field?.name ?? 'undefined';

    switch (value?.field?.fieldType?.name) {
      case 'Image':
        content[key] = (value.mediaFileId ? value.mediaFile?.url : value.value) ?? '';
        break;
      case 'CheckBox':
        content[key] = value.value?.toLowerCase() === 'true';
        break;
      default:
        content[key] = value.value ?? '';
    }
  }

  return content;
}
