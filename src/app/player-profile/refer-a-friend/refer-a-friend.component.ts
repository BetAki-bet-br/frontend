import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReferAFriendService } from './refer-a-friend.service';
import { ReferAFriendInput, ReferAFriendStatistics } from '@app/@core/gateway';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BRAND } from '@app/@core/brand';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-refer-a-friend',
  imports: [ReactiveFormsModule, TranslateModule, MatIconModule, PageBreadcrumbsComponent],
  templateUrl: './refer-a-friend.component.html',
  styleUrls: ['./refer-a-friend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferAFriendComponent implements OnInit {
  private referAFriendService = inject(ReferAFriendService);
  private fb = inject(FormBuilder);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);
  private readonly brand = inject(BRAND);

  statistics = toSignal<ReferAFriendStatistics | null>(this.referAFriendService.getReferAFriendStatistics(), {
    initialValue: null,
  });
  referForm: FormGroup;
  readonly isLoading = signal(false);
  // Placeholder as per design; the real referral code still has to come from the backoffice.
  referralLink = `${this.brand.seo.hostname.replace(/^https?:[/][/]/, '').replace(/[/]$/, '')}/ref/vini123`;
  readonly copied = signal(false);

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
      text: 'Refer a friend',
    },
  ];
  constructor() {
    this.referForm = this.fb.group({
      referees: this.fb.array([]),
    });
    this.addReferee();
  }

  ngOnInit(): void {
    this.referralLink = `${window.location.origin}/register?ref=USER_ID_PLACEHOLDER`;
  }

  get referees() {
    return this.referForm.get('referees') as FormArray;
  }

  addReferee() {
    const refereeGroup = this.fb.group({
      name: ['', Validators.required],
      contact: ['', [Validators.required, Validators.email]],
    });
    this.referees.push(refereeGroup);
  }

  removeReferee(index: number) {
    this.referees.removeAt(index);
  }

  copyLink() {
    navigator.clipboard.writeText(this.referralLink);
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }

  onSubmit() {
    if (this.referForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.referForm.value;

    const request: ReferAFriendInput = {
      language: this.translateService.currentLang,
      registrationLink: '/register',
      homeLink: window.location.origin,
      referees: formValue.referees,
    };

    this.referAFriendService.referAFriend(request).subscribe({
      next: (accepted) => {
        this.isLoading.set(false);
        if (accepted) {
          this.snackBar.open(this.translateService.instant(marker('Invitations sent successfully!')), 'OK', {
            duration: 3000,
          });
          this.referForm.reset();
          this.referees.clear();
          this.addReferee();
          // this.statistics().
        } else {
          this.snackBar.open(
            this.translateService.instant(marker('Some invitations failed. Please check details.')),
            'OK',
            { duration: 3000 },
          );
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.snackBar.open(this.translateService.instant(marker('Error sending invitations.')), 'OK', {
          duration: 3000,
        });
      },
    });
  }
}
