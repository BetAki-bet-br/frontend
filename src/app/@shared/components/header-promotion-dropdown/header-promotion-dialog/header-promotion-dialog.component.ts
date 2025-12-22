import { DIALOG_DATA, DialogRef, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
// Added CommonModule
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { PromotionDetailsResolved } from '@app/@shared/models';
import { ActionIdEnum, PromotionActivateTemplateSourceEnum } from '@app/@shared/models/template.model';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe'; // Added RenderTemplatePipe
import { TemplateService } from '@app/@shared/services/template.service';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { ActionType } from '@app/promotions/promotions.models';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('HeaderPromotionDialogComponent');

export interface HeaderPromotionDialogData {
  displaySkip?: boolean;
  promotion?: PromotionDetailsResolved;
}

export interface HeaderPromotionDialogResult {
  type: ActionType;
  promotion?: PromotionDetailsResolved;
}

@Component({
  selector: 'app-header-promotion-dialog',
  templateUrl: './header-promotion-dialog.component.html',
  styleUrls: ['./header-promotion-dialog.component.scss'],
  imports: [TranslateModule, BaseDialogComponent, RenderTemplatePipe, DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPromotionDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject<DialogRef<HeaderPromotionDialogResult>>(DialogRef);
  data = inject<HeaderPromotionDialogData>(DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);
  private templateService = inject(TemplateService);
  private destroyRef = inject(DestroyRef);
  private currentTime: number = new Date().getTime();
  private interval: any;
  private sub: Subscription | undefined;

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.currentTime = new Date().getTime();
      this.templateActivateData = {
        ...this.templateActivateData,
        seconds: this.seconds,
        minutes: this.minutes,
        hours: this.hours,
        days: this.days,
        displaySkip: this.data?.displaySkip ?? false,
        source: PromotionActivateTemplateSourceEnum.HeaderPromotionItemDialogActivate,
      };
      this.cdr.markForCheck();
    }, 500);

    this.templateService.templateActionSub$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response?.actionId === ActionIdEnum.SkipActivatePromotion) {
        this.bonusAction('Skip');
      } else if (
        response?.actionId === ActionIdEnum.OptInPromotion &&
        response?.data?.source === 'headerPromotionItemDialogActivate'
      ) {
        this.bonusAction('OptIn');
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    if (this.sub) this.sub.unsubscribe();
  }

  get promotion() {
    return this.data?.promotion;
  }

  get templateActivateData() {
    return this.promotion?.templateActivateData;
  }

  set templateActivateData(value: { [key: string]: any } | undefined) {
    if (this.promotion && value) {
      this.promotion.templateActivateData = value;
    }
  }

  get templateActivateRaw() {
    return this.promotion?.templateActivateRaw;
  }

  get promotionActiveTime() {
    return this.promotion?.promotionEndDate
      ? new Date(this.promotion.promotionEndDate)?.getTime() - this.currentTime
      : null;
  }

  get days() {
    return this.promotionActiveTime ? Math.floor(this.promotionActiveTime / (1000 * 3600 * 24)) : 0;
  }

  get hours() {
    return this.promotionActiveTime
      ? Math.floor((this.promotionActiveTime - this.days * (1000 * 3600 * 24)) / (1000 * 3600))
      : 0;
  }

  get minutes() {
    return this.promotionActiveTime
      ? Math.floor(
          (this.promotionActiveTime - (this.days * (1000 * 3600 * 24) + this.hours * (1000 * 3600))) / (1000 * 60),
        )
      : 0;
  }

  get seconds() {
    return this.promotionActiveTime
      ? Math.floor(
          (this.promotionActiveTime -
            (this.days * (1000 * 3600 * 24) + this.hours * (1000 * 3600) + this.minutes * (1000 * 60))) /
            1000,
        )
      : 0;
  }

  bonusAction(type: ActionType) {
    this.dialogRef.close({ type, promotion: this.promotion });
  }
}
