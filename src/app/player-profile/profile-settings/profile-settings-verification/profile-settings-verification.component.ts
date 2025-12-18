import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationService } from '@app/@core/configuration.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import { FileUploadConfiguration } from '@app/@shared/components/file-uploader/file-upload.component';
import { MessageDialogComponent } from '@app/@shared/components/message-dialog/message-dialog.component';
import { CountryCode } from '@app/@shared/models';
import { GeoLocationMapped, GeoLocationService } from '@app/@shared/services/geolocation.service';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import {
  FaceAuthUpdatePlayerRequest,
  PlayerDetails,
  PlayerDocument,
  UpdatePlayerRequest,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, catchError, of, switchMap, throwError } from 'rxjs';

const log = new Logger('ProfileSettingsVerificationComponent');

interface phoneVerificationForm {
  phoneNumber: FormControl<string | null>;
  countryCode: FormControl<CountryCode | null>;
}

@Component({
  selector: 'app-profile-settings-verification',
  templateUrl: './profile-settings-verification.component.html',
  styleUrls: ['./profile-settings-verification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsVerificationComponent implements OnInit, OnDestroy {
  countriesCode: CountryCode[] = [];

  phoneVerificationForm: FormGroup<phoneVerificationForm> = new FormGroup({
    phoneNumber: new FormControl<string>('', {
      validators: [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(4),
        Validators.maxLength(20),
      ],
    }),
    countryCode: new FormControl<CountryCode | null>(null, Validators.required),
  });

  playerInfo?: PlayerDetails;
  phoneVerificationStatus?: string;
  uploadedDocuments?: PlayerDocument[];
  fileUploading = '';

  get countryCodeControl() {
    return this.phoneVerificationForm.controls.countryCode;
  }

  uploadFileConfig: FileUploadConfiguration = {
    fileType: ['png', 'jpg', 'pdf', 'doc', 'heic'],
    maxFileSizeKB: 0,
  };

  // export to template
  validateNumber = validateNumber;

  private subscription: Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    private playerProfileService: PlayerProfileService,
    private geoLocationService: GeoLocationService,
    private snackbarService: SnackbarService,
    private configurationService: ConfigurationService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // fetch country codes
    this.playerProfileService
      .getCountryCodes()
      .pipe(
        catchError((error) =>
          throwError(() => {
            // if country codes retrieval had errors, throw message
            this.snackbarService.openCustomError(
              this.translate.instant('Error retrieving country codes'),
              'center',
              'top',
              4000
            );
            return of(null);
          })
        )
      )
      .pipe(
        switchMap((data: CountryCode[]) => {
          // check country codes for errors -> null
          if (data === null) {
            return of(null);
          }
          // otherwise assign data to countriesCode variable
          this.countriesCode = [...data];
          // fetch and return geolocation data
          return this.geoLocationService.getLocationByIP();
        }),
        catchError((error) =>
          throwError(() => {
            // if geolocation data retrieval had errors, throw message
            this.snackbarService.openCustomError(
              this.translate.instant('Error retrieving geolocation data'),
              'center',
              'top',
              4000
            );
            return of(null);
          })
        )
      )
      .subscribe({
        next: (geoData: GeoLocationMapped | null) => {
          // check geoData for errors -> null
          if (geoData !== null) {
            const cc: CountryCode | undefined | null =
              this.countriesCode && this.countriesCode !== null && this.countriesCode.length > 0
                ? this.countriesCode.find((c) => c.code === geoData?.country_code)
                : null;
            this.countryCodeControl.patchValue(cc ?? null);
          }
        },
        complete: () => {},
        error: (error) => {
          log.debug('ProfileSettingsVerificationComponent -> ngOnInit subscription failed with error:', error);
        },
      });

    this.getPlayerInfo();
    this.getUploadedDocuments();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openInfo(typeNum: number) {
    let title;
    let description;

    switch (typeNum) {
      case 0:
        title = 'Proof of Identity';
        description = `Passport, Driving License or official Government issued ID card.
        Must be a Passport, Driving License or other official Government issued ID card.
        Both Front and Back of ID card must be received. Document must be in date and not expired.
        Document must be showing expiry date. Document must show your unaltered photo.
        Document must show your date of birth. Water marks on documents must be visible.`;

        break;
      case 1:
        title = 'Proof of Address';
        description = `Utility bill, phone bill or bank statement displaying your name and address
        in full. Must be either a utility bill, mobile phone bill or bank statement. Must show your
        FULL address including any post/zip codes. Must show your FULL name. Must display official
        logo of issuing company. Must be dated within the last 180 days. Must be able to see full document.`;

        break;
      case 2:
        title = 'Proof of Payment';
        description = `You must submit all bank cards used within the last 6 months.
          Each card must visibly show your first 6 and last 4 card numbers, your full name,
          expiry date and all 4 edges/corners of the bank card.`;
        break;
    }

    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '31.125rem',
      data: {
        title: title,
        description: description,
      },
    });
  }

  uploadFile(file: File) {
    this.fileUploading = (file as any).inputId;
    this.cdr.markForCheck();
    this.playerProfileService.uploadDocument(file).subscribe({
      complete: () => {
        this.snackbarService.openCustomSuccess('File "' + file.name + '" uploaded successfully.', 'center', 'top');
        this.fileUploading = '';
        this.cdr.markForCheck();
        this.getUploadedDocuments();
      },
      error: (err) => {
        if (err.error.errorMessage === 'DocumentUploadLimitExceeded') {
          this.snackbarService.openCustomError(
            this.translate.instant('Maximum file size overreached. Upload smaller file size'),
            'center',
            'top'
          );
        } else if (err.error.errorMessage === 'DocumentFormatNotSupported') {
          this.snackbarService.openCustomError(
            this.translate.instant('File format is not supported for "') + file.name + '"',
            'center',
            'top'
          );
        } else {
          this.snackbarService.openCustomError(
            this.translate.instant('Failed to upload file "') + file.name + '"',
            'center',
            'top'
          );
        }
        this.fileUploading = '';
        this.cdr.markForCheck();
      },
    });
  }

  onDeleteNumber() {
    if (this.playerInfo) {
      const body: FaceAuthUpdatePlayerRequest = {
        eMail: this.playerInfo.eMail as string,
        firstName: this.playerInfo.firstName as string,
        lastName: this.playerInfo.lastName as string,
        city: this.playerInfo.city ?? undefined,
        postalCode: this.playerInfo.postalCode ?? undefined,
        street: this.playerInfo.street ?? undefined,
        mobilePhone: undefined,
      };

      this.playerProfileService.updatePlayerSettings(body).subscribe({
        next: (res) => {
          this.snackbarService.openCustomSuccess(
            this.translate.instant('Phone number deleted successfully'),
            'center',
            'top',
            4000
          );
          this.playerProfileService.numberChanged.next(true);
          this.getPlayerInfo(false);
        },
        error: (err) => {
          this.snackbarService.openCustomError(
            this.translate.instant('Failed to delete phone number'),
            'center',
            'top',
            4000
          );
        },
      });
    }
  }

  onAddNumber() {
    if (this.playerInfo && this.phoneVerificationForm.valid) {
      const formValue = this.phoneVerificationForm.value;

      if (formValue.countryCode?.dial_code && formValue.phoneNumber) {
        const number = this.phoneVerificationForm.controls.countryCode.value?.dial_code + formValue.phoneNumber;

        const body: FaceAuthUpdatePlayerRequest = {
          eMail: this.playerInfo.eMail as string,
          firstName: this.playerInfo.firstName as string,
          lastName: this.playerInfo.lastName as string,
          mobilePhone: number,
          // in order for PUT to save properties correctly, other data must be sent as well, because
          // partial update doesn't work as expected on backend side
          postalCode: this.playerInfo.postalCode as string,
          street: this.playerInfo.street as string,
          city: this.playerInfo.city as string,
        };

        this.playerProfileService.updatePlayerSettings(body).subscribe({
          next: (res) => {
            this.snackbarService.openCustomSuccess(
              this.translate.instant('Phone number added successfully'),
              'center',
              'top',
              4000
            );
            this.playerProfileService.numberChanged.next(true);
            this.getPlayerInfo(false);
          },
          error: (err) => {
            this.snackbarService.openCustomError(
              this.translate.instant('Failed to delete phone number'),
              'center',
              'top',
              4000
            );
          },
        });
      }
    }
  }

  private getUploadedDocuments() {
    this.playerProfileService.getUploadedDocument().subscribe({
      next: (data) => {
        this.uploadedDocuments = [...data];
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.snackbarService.openCustomError(
          this.translate.instant('Error retrieving uploaded documents'),
          'center',
          'top',
          4000
        );
      },
    });
  }

  public getPlayerInfo(fromCache = true) {
    this.configurationService.getPlayerInfo(fromCache).subscribe({
      next: (data) => {
        this.playerInfo = { ...data };
        this.cdr.markForCheck();

        if (this.playerInfo.mobilePhone) {
          this.checkForNumberVerification();
        }
      },
      error: () =>
        this.snackbarService.openCustomError(
          this.translate.instant('Error retrieving player info'),
          'center',
          'bottom',
          4000
        ),
    });
  }

  /**
   * Method to update verification page data, that can be called from parent component, that already has updated data
   * to avoid redundant API calls
   *
   * @param playerInfoData
   * @param phoneVerification
   */
  public setUpdatedPlayerInfo(playerInfoData: PlayerDetails | null, phoneVerification: string) {
    this.playerInfo = { ...playerInfoData };
    if (this.playerInfo.mobilePhone) {
      this.phoneVerificationStatus = phoneVerification;
    }
    this.cdr.markForCheck();
  }

  private checkForNumberVerification() {
    this.playerProfileService.checkNumberVerification().subscribe({
      next: (res) => {
        this.phoneVerificationStatus = res;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.snackbarService.openCustomError(
          this.translate.instant('Error checking phone verification status'),
          'center',
          'top',
          4000
        );
      },
    });
  }
}
