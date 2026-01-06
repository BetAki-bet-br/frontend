import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  host: {
    '[class.w-full]': 'fullWidth'
  }
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input({ transform: booleanAttribute }) fullWidth = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get classes(): string {
    // !important utilities might be needed to override Angular Material defaults depending on ViewEncapsulation
    const base = 'relative font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 !leading-normal tracking-wide';
    
    const variants: Record<ButtonVariant, string> = {
      // Primary: The brand color (Lime Greenish)
      primary: 'bg-betaki-500 !text-white hover:opacity-90 active:opacity-100 shadow-sm border border-transparent',
      
      // Secondary: Dark background (Shark 900)
      secondary: 'bg-shark-900 !text-white hover:bg-shark-800 border border-transparent',
      
      // Outline: Transparent with brand border
      outline: 'bg-transparent border-2 border-betaki-500 !text-betaki-500 hover:bg-betaki-500 hover:!text-white',
      
      // Ghost: Text only
      ghost: 'bg-transparent !text-betaki-500 hover:bg-shark-50/10',
      
      // Danger
      danger: 'bg-red-600 !text-white hover:bg-red-700'
    };

    const sizes: Record<ButtonSize, string> = {
      sm: '!py-1 !px-3 !text-xs',
      md: '!py-2 !px-6 !text-sm', 
      lg: '!py-3 !px-8 !text-lg'
    };

    const width = this.fullWidth ? 'w-full' : 'w-auto';
    const state = (this.disabled || this.loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

    return `${base} ${variants[this.variant]} ${sizes[this.size]} ${width} ${state}`;
  }
}
