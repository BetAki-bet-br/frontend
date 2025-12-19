import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { UsernameOrEmailTakenValidator } from '@app/@shared/validators/username-or-email-taken.validator';
import { AuthenticationService } from '@app/auth/authentication.service';
import { Credentials } from '@app/auth/credentials.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PlayerService, PortalGatewayErrorResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, delay, finalize, map, of, switchMap } from 'rxjs';

export interface SetUsernameDialogData {
  credentials: Credentials;
  password: string;
}

const log = new Logger('SetUsernameDialog');

@UntilDestroy()
@Component({
  selector: 'app-set-username-dialog',
  templateUrl: './set-username-dialog.component.html',
  styleUrls: ['./set-username-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SetUsernameDialogComponent implements OnInit {
  @ViewChild('usernameInput', { static: true }) usernameInput!: ElementRef<HTMLElement>;

  error: string = '';
  isDataLoading = false;

  usernameForm = new FormGroup({
    username: new FormControl<string>('', {
      updateOn: 'blur',
      validators: [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9]+$')],
      asyncValidators: [
        UsernameOrEmailTakenValidator.usernameOrEmailTakenValidator(
          this.playerService,
          this.dataStoreService,
          'Username'
        ),
      ],
    }),
  });

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: SetUsernameDialogData,
    private playerService: PlayerService,
    private authService: AuthenticationService,
    private cdr: ChangeDetectorRef,
    private dataStoreService: DataStoreService
  ) {}

  ngOnInit(): void {
    this.usernameForm.controls.username?.addAsyncValidators(this.validateUsernameTaken);
    this.usernameForm.controls.username?.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      if (!this.usernameForm.controls.username.touched) this.usernameForm.controls.username.markAllAsTouched();
    });
    this.usernameForm.controls.username?.statusChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      if (val === 'INVALID') {
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitUsername() {
    // reset error
    this.error = '';
    this.cdr.markForCheck();

    if (this.usernameForm.invalid) {
      this.usernameInput.nativeElement.focus();

      return;
    }

    this.isDataLoading = true;

    // this.playerService
    //   .apiPortalV1PlayerUsernamePut({
    //     changeUserNameToken: this.data.credentials.changeUsernameToken ?? '',
    //     newUserName: this.usernameForm.controls.username.value ?? '',
    //     portalId: this.dataStoreService.defaultPortalId,
    //     sessionToken: this.data.credentials.sessionKey,
    //   })
    //   .pipe(untilDestroyed(this))
    //   .subscribe({
    //     next: (res) => {
    //       this.login();
    //     },
    //     error: (err) => {
    //       this.isDataLoading = false;
    //     },
    //   });
  }

  private login() {
    this.authService
      .login({
        username: this.usernameForm.controls.username.value ?? '',
        password: this.data.password,
      })
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.isDataLoading = false;
        })
      )
      .subscribe({
        next: ({ credentials, loginFaceAuth }) => {
          log.debug(`${credentials?.username} successfully logged in`);

          if (credentials?.username) {
            this.dialogRef.close();
          } else {
            this.error = marker('Error logging in');
          }
        },
        error: (error) => {
          log.debug(`Login error: ${error}`);
          const responseError = (error as HttpErrorResponse).error as PortalGatewayErrorResponse;
          if (responseError?.errorMessage) {
            this.error = responseError.errorMessage;
          } else {
            this.error = marker('Error logging in');
          }
        },
      });
  }

  validateUsernameTaken = (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = control.value;

    return of(username).pipe(
      delay(500),
      switchMap((username) =>
        this.playerService
          .apiPortalV1PlayerValidateDataPost({
            portalId: this.dataStoreService.defaultPortalId,
            playerDataList: [
              {
                type: 'Username',
                value: username,
              },
            ],
          })
          .pipe(
            map((res) => {
              if (res[0]?.status === 'PrincipalExist') {
                return { usernameTaken: true };
              } else {
                return null;
              }
            })
          )
      )
    );
  };
}
