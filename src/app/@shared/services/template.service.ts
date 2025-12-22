import { Injectable, inject } from '@angular/core';
import { Logger } from '../logger.service';
import { Observable, Subject, map, of } from 'rxjs';
import {
  ContentFieldValue,
  TemplateData,
  TemplateService as TemplateServiceApi,
} from '@icore/ngx-portalgateway-api-client-atl';
import { DataStoreService } from '@app/@core';
import { environment } from '@env/environment';
import { TemplateAction, TemplateCustomEventData } from '../models/template.model';
import { TEMPLATES } from './cms-templates-data';
import { Router } from '@angular/router';

const log = new Logger('TemplateService');

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private dataStoreService = inject(DataStoreService);
  private templateService = inject(TemplateServiceApi);
  private router = inject(Router);

  private templateActionSub = new Subject<TemplateAction | null>();

  templateActionSub$ = this.templateActionSub.asObservable();

  constructor() {
    this.addGlobalEventListener();
  }

  addGlobalEventListener() {
    window.addEventListener('globalTemplateEvent', (event: Event) => {
      // action event (ActionIdEnum)
      const customEvent = event as CustomEvent<TemplateCustomEventData>;
      const eventData = customEvent.detail;

      // if action: trigger appropriate action
      // else redirect to url
      if (eventData.url.startsWith('action:')) {
        this.templateActionSub.next({
          actionId: eventData?.url?.split(':')?.[1],
          data: eventData,
        });
      } else {
        if (eventData.url) {
          if (eventData.openInNewWindow) {
            this.openInNewTab(eventData.url);
          } else {
            // For relative URLs use the angular router.
            if (this.isAbsoluteUrl(eventData.url)) {
              window.open(eventData.url, '_self');
            } else {
              this.router.navigateByUrl(eventData.url);
            }
          }
        }
      }
    });
  }

  transformContent(contentFieldValues: ContentFieldValue[] | undefined): { [key: string]: any } {
    const newContent: { [key: string]: any } = {};
    contentFieldValues?.map((value) => {
      const fieldTypeName = value?.field?.fieldType?.name;
      const key = value?.field?.name ?? 'undefined';
      if (fieldTypeName === 'Image') {
        if (value?.mediaFileId) {
          newContent[key] = value?.mediaFile?.url;
        } else {
          newContent[key] = value?.value ?? '';
        }
      } else if (fieldTypeName === 'CheckBox') {
        const val = value?.value;
        newContent[key] = val?.toLowerCase() === 'true';
      } else {
        newContent[key] = value.value ?? '';
      }
    });
    return newContent;
  }

  getTemplatesList(): Observable<TemplateData[]> {
    // if already cached, return from dataStore
    if (this.dataStoreService.isTemplatesListCached()) {
      return of(this.dataStoreService.templatesList);
    } else {
      // For dev we use local templates for easier changes
      if (environment.useLocalHtmlTemplates) {
        return of(TEMPLATES);
      }

      // otherwise, get them from api
      return this.templateService.apiPortalV1CmsTemplatesGet(environment.deployConfig.brandId).pipe(
        map((response) => {
          this.dataStoreService.templatesList = response;
          return this.dataStoreService.templatesList;
        }),
      );
    }
  }

  private isAbsoluteUrl(url: string) {
    // A regular expression to test if the URL starts
    // with a scheme (http, https, ftp, etc.) followed by "://"
    const regex = new RegExp('^(?:[a-z]+:)+//', 'i');
    return regex.test(url);
  }

  private openInNewTab(relativeOrAbsoluteUrl: string) {
    const url = new URL(relativeOrAbsoluteUrl, window.location.origin).toString();
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
