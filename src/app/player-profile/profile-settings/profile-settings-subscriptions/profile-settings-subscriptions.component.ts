import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Breadcrumbs } from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { Logger } from '@app/@shared/logger.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import {
  ContactPrefChannels,
  GetPlayerContactPreferencesResponse,
  UpdatePlayerContactPrefRequest,
} from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('ProfileSettingsSubscriptionsComponent');

@UntilDestroy()
@Component({
  selector: 'app-profile-settings-subscriptions',
  templateUrl: './profile-settings-subscriptions.component.html',
  styleUrls: ['./profile-settings-subscriptions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsSubscriptionsComponent implements OnInit {
  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
      url: '/profile',
    },
    {
      text: 'Privacy settings',
    },
  ];

  subscriptionsForm = this.fb.group({
    receiveExclusiveOffersAndBonuses: this.fb.control<boolean | null>(null),
    receivePromosBySMS: this.fb.control<boolean | null>(null),
    receivePromosByIm: this.fb.control<boolean | null>(null),
    receivePromosByEmail: this.fb.control<boolean | null>(null),
    receivePromosByTelephone: this.fb.control<boolean | null>(null),
    receivePromosByPost: this.fb.control<boolean | null>(null),
    receivePromosByPopupInbox: this.fb.control<boolean | null>(null),
  });

  private contactPreferences!: GetPlayerContactPreferencesResponse | UpdatePlayerContactPrefRequest | null;

  constructor(
    private fb: FormBuilder,
    private playerProfileService: PlayerProfileService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService
  ) {}

  get receiveExclusiveOffersAndBonuses() {
    return this.subscriptionsForm.get('receiveExclusiveOffersAndBonuses')?.value;
  }

  get receivePromosBySMS() {
    return this.subscriptionsForm.get('receivePromosBySMS')?.value;
  }

  get receivePromosByIm() {
    return this.subscriptionsForm.get('receivePromosByIm')?.value;
  }

  get receivePromosByEmail() {
    return this.subscriptionsForm.get('receivePromosByEmail')?.value;
  }

  get receivePromosByTelephone() {
    return this.subscriptionsForm.get('receivePromosByTelephone')?.value;
  }

  get receivePromosByPost() {
    return this.subscriptionsForm.get('receivePromosByPost')?.value;
  }

  get receivePromosByPopupInbox() {
    return this.subscriptionsForm.get('receivePromosByPopupInbox')?.value;
  }

  ngOnInit(): void {
    this.loadData();

    // on receive promos by email change
    this.subscriptionsForm.controls.receiveExclusiveOffersAndBonuses.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.subscriptionsForm.patchValue({
          receivePromosBySMS: value,
          receivePromosByIm: value,
          receivePromosByEmail: value,
          receivePromosByTelephone: value,
          receivePromosByPost: value,
          receivePromosByPopupInbox: value,
        });

        if (!!value) {
          this.subscriptionsForm.controls.receivePromosBySMS.enable();
          this.subscriptionsForm.controls.receivePromosByIm.enable();
          this.subscriptionsForm.controls.receivePromosByEmail.enable();
          this.subscriptionsForm.controls.receivePromosByTelephone.enable();
          this.subscriptionsForm.controls.receivePromosByPost.enable();
          this.subscriptionsForm.controls.receivePromosByPopupInbox.enable();
        } else {
          this.subscriptionsForm.controls.receivePromosBySMS.disable();
          this.subscriptionsForm.controls.receivePromosByIm.disable();
          this.subscriptionsForm.controls.receivePromosByEmail.disable();
          this.subscriptionsForm.controls.receivePromosByTelephone.disable();
          this.subscriptionsForm.controls.receivePromosByPost.disable();
          this.subscriptionsForm.controls.receivePromosByPopupInbox.disable();
        }
      });
  }

  private loadData() {
    this.playerProfileService
      .getContactPreferences()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (getContactPreferences) => {
          this.contactPreferences = getContactPreferences ?? null;
          this.setGeneralForm();
        },
        error: (err) => {
          log.debug('Get contact preferences failed with error:', err);
        },
        complete: () => {
          log.debug('Get contact preferences completed');
        },
      });
  }

  updateContactPreferences() {
    const request: UpdatePlayerContactPrefRequest = {
      ...this.contactPreferences,
      contactPrefChannels: {
        sms: !!this.receivePromosBySMS && !!this.receiveExclusiveOffersAndBonuses,
        im: !!this.receivePromosByIm && !!this.receiveExclusiveOffersAndBonuses,
        email: !!this.receivePromosByEmail && !!this.receiveExclusiveOffersAndBonuses,
        telephone: !!this.receivePromosByTelephone && !!this.receiveExclusiveOffersAndBonuses,
        post: !!this.receivePromosByPost && !!this.receiveExclusiveOffersAndBonuses,
        popupInbox: !!this.receivePromosByPopupInbox && !!this.receiveExclusiveOffersAndBonuses,
      },
      receiveExclusiveOffersAndBonuses: !!this.receiveExclusiveOffersAndBonuses,
    };

    this.playerProfileService
      .updateContactPreferences(request)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          this.snackbarService.openCustomSuccess(
            this.translateService.instant('Privacy settings updated successfully'),
            'center',
            'top',
            4000
          );
          this.contactPreferences = request;
          this.setGeneralForm();
          this.subscriptionsForm.markAsPristine();
        },
        error: (err) => {
          log.debug('Update contact preferences failed with error:', err);
        },
        complete: () => {
          log.debug('Update contact preferences completed');
        },
      });
  }

  private setGeneralForm() {
    const receiveOffers = this.contactPreferences?.receiveExclusiveOffersAndBonuses;

    this.subscriptionsForm.patchValue(
      {
        receiveExclusiveOffersAndBonuses: receiveOffers,
        receivePromosBySMS: receiveOffers && this.contactPreferences?.contactPrefChannels?.sms,
        receivePromosByIm: receiveOffers && this.contactPreferences?.contactPrefChannels?.im,
        receivePromosByEmail: receiveOffers && this.contactPreferences?.contactPrefChannels?.email,
        receivePromosByTelephone: receiveOffers && this.contactPreferences?.contactPrefChannels?.telephone,
        receivePromosByPost: receiveOffers && this.contactPreferences?.contactPrefChannels?.post,
        receivePromosByPopupInbox: receiveOffers && this.contactPreferences?.contactPrefChannels?.popupInbox,
      },
      { emitEvent: false }
    );

    if (this.receiveExclusiveOffersAndBonuses) {
      this.subscriptionsForm.controls.receivePromosBySMS.enable();
      this.subscriptionsForm.controls.receivePromosByIm.enable();
      this.subscriptionsForm.controls.receivePromosByEmail.enable();
      this.subscriptionsForm.controls.receivePromosByTelephone.enable();
      this.subscriptionsForm.controls.receivePromosByPost.enable();
      this.subscriptionsForm.controls.receivePromosByPopupInbox.enable();
    } else {
      this.subscriptionsForm.controls.receivePromosBySMS.disable();
      this.subscriptionsForm.controls.receivePromosByIm.disable();
      this.subscriptionsForm.controls.receivePromosByEmail.disable();
      this.subscriptionsForm.controls.receivePromosByTelephone.disable();
      this.subscriptionsForm.controls.receivePromosByPost.disable();
      this.subscriptionsForm.controls.receivePromosByPopupInbox.disable();
    }
  }
}
