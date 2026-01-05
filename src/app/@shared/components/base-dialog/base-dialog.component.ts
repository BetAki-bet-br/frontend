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
  QueryList,
  AfterContentChecked,
  ElementRef,
  ContentChildren,
  SimpleChanges,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-dialog',
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatRippleModule, CdnizePipe],
})
export class BaseDialogComponent implements OnInit, OnDestroy, OnChanges, AfterContentChecked {
  private dialogRef = inject<DialogRef<BaseDialogComponent>>(DialogRef);
  private breakpointObserver = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('sm');
  @Input() position: 'top' | 'center' | 'bottom' | 'bottom-right' = 'center';
  @Input() title!: string;
  @Input() width!: string;
  @Input() height!: string;
  @Input() customClass: string = '';
  @Input() displayCloseButton: boolean = false;
  @Input() displayLogo: boolean = true;
  @Input() displayTopBar: boolean = true;
  @Input() fullscreenMobile: boolean = true;
  @Input() widthMobile!: string;
  @Input() customButtonClass: string = '';
  isMobile: boolean = false;

  readonly defaultWidth: string = '486px';

  private subscriptions: Subscription[] = [];

  @ContentChildren('dialogContent', { read: ElementRef })
  private dialogContentElements!: QueryList<ElementRef>;

  hasDialogContent = signal(false);
  closing = signal(false);

  ngOnInit(): void {
    this.subscriptions.push(
      this.breakpointObserver.observe([AppBreakpoints.LtSmall2]).subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;

        // Force full screen overlay to allow CSS centering and backdrop control
        this.dialogRef.updateSize('100%', '100%');
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['height'] || changes['width']) {
      // Ensure we keep full screen even if inputs change, layout is handled by template
      this.dialogRef.updateSize('100%', '100%');
      this.cdr.markForCheck();
    }
  }

  ngAfterContentChecked(): void {
    const newHasContent = this.dialogContentElements && this.dialogContentElements.length > 0;
    if (newHasContent !== this.hasDialogContent()) {
      this.hasDialogContent.set(newHasContent);
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  closeDialog() {
    this.closing.set(true);
  }

  onAnimationEnd(event: AnimationEvent) {
    if (this.closing() && event.target === event.currentTarget) {
      this.dialogRef.close();
    }
  }

  get dialogStyleWidth(): string | null {
    if (this.isMobile) {
      return this.widthMobile ?? '100%';
    }
    return this.width || (this.size() ? null : this.defaultWidth);
  }

  get dialogStyleHeight(): string | null {
    if (this.isMobile && this.fullscreenMobile) {
      return '100%';
    }
    return this.height || null;
  }
}
