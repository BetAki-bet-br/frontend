import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReferAFriendService } from './refer-a-friend.service';
import {
  ReferAFriendStatisticsResponse,
  ReferAFriendRequest,
  RequestTypeEnum,
} from '@icore/ngx-portalgateway-api-client-atl';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-refer-a-friend',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    PageBreadcrumbsComponent,
  ],
  templateUrl: './refer-a-friend.component.html',
  styleUrls: ['./refer-a-friend.component.scss'],
})
export class ReferAFriendComponent implements OnInit {
  private referAFriendService = inject(ReferAFriendService);
  private fb = inject(FormBuilder);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  statistics = toSignal<ReferAFriendStatisticsResponse | null>(this.referAFriendService.getReferAFriendStatistics(), {
    initialValue: null,
  });
  referForm: FormGroup;
  isLoading = false;
  referralLink = 'betaki.com/ref/vini123'; // Placeholder as per design
  copied = false;

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
    this.addReferee(); // Add one initial row
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
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }

  onSubmit() {
    if (this.referForm.invalid) return;

    this.isLoading = true;
    const formValue = this.referForm.value;

    const request: ReferAFriendRequest = {
      requestType: RequestTypeEnum.Email,
      language: this.translateService.currentLang,
      registrationLink: '/register',
      homeLink: window.location.origin,
      referees: formValue.referees,
    };

    this.referAFriendService.referAFriend(request).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.rafRequestValid) {
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
        this.isLoading = false;
        this.snackBar.open(this.translateService.instant(marker('Error sending invitations.')), 'OK', {
          duration: 3000,
        });
      },
    });
  }
}
