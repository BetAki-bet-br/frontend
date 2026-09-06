import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';
import { TestBed } from '@angular/core/testing';
import { provideAppTesting } from '@testing/app-testing';

// `src/main.ts` registers this before bootstrapping; without it every `date`/`currency`/`number`
// pipe in a template throws NG0701 as soon as a component renders under test.
registerLocaleData(localePt, 'pt-BR', localePtExtra);

/**
 * Root-level setup, applied to every spec in the run.
 *
 * A `beforeEach` declared outside any `describe` attaches to jasmine's root suite, so this runs
 * after the TestBed reset and before each spec's own `beforeEach`. `configureTestingModule` merges
 * across calls, which lets a spec add its imports without repeating the application's providers.
 *
 * This file has no `it` of its own on purpose: it exists only so the karma builder loads it.
 */
beforeEach(() => {
  TestBed.configureTestingModule({ providers: provideAppTesting() });
});
