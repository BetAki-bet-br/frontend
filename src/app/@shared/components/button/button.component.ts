import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'white'
  | 'outline-white'
  | 'neutral'
  | 'outline-neutral'
  | 'dark'
  | 'outline-shark';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonShape = 'rectangle' | 'pill' | 'circle';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  host: {
    '[class.w-full]': 'fullWidth',
  },
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() shape: ButtonShape = 'rectangle';
  @Input() overrideClass = '';
  @Input({ transform: booleanAttribute }) fullWidth = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get classes(): string {
    // !important utilities might be needed to override Angular Material defaults depending on ViewEncapsulation
    const base =
      'relative font-bold transition-all duration-200 flex items-center justify-center gap-2 !leading-normal tracking-wide';

    const variants: Record<ButtonVariant, string> = {
      // Primary: The brand color (Lime Greenish)
      primary: 'bg-brand-500 !text-white hover:opacity-90 active:opacity-100 shadow-sm border border-transparent',

      // Secondary: Dark background (Shark 900)
      secondary: 'bg-shark-900! !text-white hover:bg-shark-800 border border-transparent',

      // Outline: Transparent with brand border, Black text
      outline: 'bg-transparent! border-2 border-brand-500 !text-black hover:bg-brand-500! hover:!text-white',

      // Ghost: Transparent background, White text
      ghost: 'bg-transparent! !text-white hover:bg-white/10',

      // Danger
      danger: 'bg-red-600 !text-white hover:bg-red-700',

      // White: White background, Brand text (for dark backgrounds)

      white: '!bg-white !text-brand-500 hover:bg-gray-100 border border-transparent',

      // Outline White: Off-white border/text (shark-50) - Based on "Entrar" header button

      'outline-white':
        'bg-transparent border border-shark-50 !text-shark-50 hover:bg-shark-100/20! hover:!text-shark-100 !font-medium !rounded-md',

      // Neutral: Transparent background, dark brand text (`--color-brand-ink`) - For Dialog actions

      neutral: 'bg-transparent !text-brand-ink hover:bg-gray-100',

      // Outline Neutral: Transparent background, Dark border, Dark text - For Dialog actions

      'outline-neutral':
        'bg-transparent border border-brand-ink/20 !text-brand-ink hover:bg-brand-ink/5 hover:border-brand-ink/40',

      // Dark: Darker brand background (for sidebar/special actions)

      dark: 'bg-brand-darker !text-white hover:opacity-80 border border-transparent',

      // Outline Shark: Off-white border/text (shark-50) - For dark backgrounds/Header

      'outline-shark':
        'bg-transparent! border! border-shark-50 !text-shark-50 hover:bg-shark-100/20 hover:border-shark-100 hover:!text-shark-100 !font-medium !rounded-md',
    };

    const sizes: Record<ButtonSize, string> = {
      xs: '!py-1 !px-2 !text-xs',
      sm: '!py-1 !px-3 !text-xs',
      md: '!py-2 !px-6 !text-sm',
      lg: '!py-3 !px-8 !text-lg',
      xl: '!py-4 !px-10 !text-xl',
    };

    const shapes: Record<ButtonShape, string> = {
      rectangle: 'rounded-md!',
      pill: 'rounded-full',
      circle: 'rounded-full !p-2 aspect-square',
    };

    const width = this.fullWidth ? 'w-full' : 'w-auto';
    const state =
      this.disabled || this.loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    // Override size padding for circle shape to ensure it remains circular and centered
    let sizeClass = sizes[this.size];
    if (this.shape === 'circle') {
      // Remove horizontal padding for circle to keep aspect ratio
      sizeClass = sizeClass.replace(/!px-\d+/g, '');
    }

    return `${base} ${variants[this.variant]} ${sizeClass} ${shapes[this.shape]} ${width} ${state} ${this.overrideClass}`;
  }
}
