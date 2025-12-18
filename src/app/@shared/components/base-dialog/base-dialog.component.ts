import { DialogRef } from '@angular/cdk/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-dialog',
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() position: 'top' | 'center' | 'bottom' = 'center';
  @Input() title!: string;
  @Input() width!: string;
  @Input() height!: string;
  @Input() customClass: string = '';
  @Input() displayCloseButton: boolean = false;
  @Input() displayLogo: boolean = true;
  @Input() displayTopBar: boolean = true;
  @Input() fullscreenMobile: boolean = true;
  @Input() widthMobile!: string;

  isMobile: boolean = false;

  readonly defaultWidth: string = '486px';

  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: DialogRef<BaseDialogComponent>,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.width) {
      this.width = this.defaultWidth;
    }

    this.subscriptions.push(
      this.breakpointObserver.observe([AppBreakpoints.LtSmall2]).subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;

        const strategy = this.dialogRef.overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
        const heightTmp = this.height ?? undefined;

        this.dialogRef.updateSize(
          this.isMobile ? this.widthMobile ?? '100%' : this.width,
          this.isMobile && this.fullscreenMobile ? '100%' : heightTmp
        );
        this.setPosition(strategy);
        this.dialogRef.updatePosition();
        this.cdr.markForCheck();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['height']) {
      const heightTmp = this.height ?? undefined;
      const strategy = this.dialogRef.overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
      this.dialogRef.updateSize(this.isMobile ? '100%' : this.width, this.isMobile ? '100%' : heightTmp);
      this.setPosition(strategy);
      this.dialogRef.updatePosition();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private setPosition(strategy: GlobalPositionStrategy) {
    switch (this.position) {
      case 'top':
        strategy.top('0');
        break;
      case 'bottom':
        strategy.bottom('0');
        break;
      case 'center':
        strategy.centerVertically();
        break;

      default:
        strategy.top('0');
        break;
    }
  }
}
