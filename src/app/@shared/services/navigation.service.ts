import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private history: { url: string; scrollY: number }[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.history.push({
        url: this.router.url,
        scrollY: window.scrollY,
      });
    });
  }

  back(): void {
    this.history.pop(); // current page
    const previous = this.history.pop();
    if (previous) {
      this.router.navigateByUrl(previous.url).then(() => {
        setTimeout(() => window.scrollTo(0, previous.scrollY), 100);
      });
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
