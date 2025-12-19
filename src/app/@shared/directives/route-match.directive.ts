import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appMatchAnyRouterLink]',
})
export class MatchAnyRouterLinkDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private router = inject(Router);

  @Input('appMatchAnyRouterLink') matchAnyRouterLink: string[] = [];
  @Input() addClass: string = '';

  private routerSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;

        const matched = this.matchAnyRouterLink.some((route) => currentUrl.includes(route));

        if (matched) {
          this.el.nativeElement.classList.add(this.addClass);
        } else {
          this.el.nativeElement.classList.remove(this.addClass);
        }
      }
    });

    // Handle initial navigation on page refresh
    const currentUrl = this.router.routerState.snapshot.url;
    const matched = this.matchAnyRouterLink.some((route) => currentUrl.includes(route));

    if (matched) {
      this.el.nativeElement.classList.add(this.addClass);
    } else {
      this.el.nativeElement.classList.remove(this.addClass);
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
