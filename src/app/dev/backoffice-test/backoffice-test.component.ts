import { Component, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  BannersService,
  FootersService,
  CategoriesService,
  MenusService,
  ShowcasesService,
  SlotsService,
  TopListsService,
  TopWinnersService,
  AwardsService,
  SettingsService,
  LobbiesService,
} from '@app/@core/backoffice';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-backoffice-test',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  template: `
    <div class="p-4 space-y-8 text-white">
      <h1 class="text-3xl font-bold">Backoffice Integration Test</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Banners -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Banners</h2>
          @if (banners(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Footers -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Footers</h2>
          @if (footers(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Categories -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Categories</h2>
          @if (categories(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Menus -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Menus</h2>
          @if (menus(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Showcases -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Showcases</h2>
          @if (showcases(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Slots -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Slots</h2>
          @if (slots(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Top Lists -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Top Lists</h2>
          @if (topLists(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Top Winners -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Top Winners (Batches)</h2>
          @if (topWinners(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Awards -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Awards (Batches)</h2>
          @if (awards(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Settings -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Public Settings</h2>
          @if (settings(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Casino Lobby -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Casino Lobby</h2>
          @if (casinoLobby(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>

        <!-- Live Lobby -->
        <section class="border p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2 text-blue-600">Live Lobby</h2>
          @if (liveLobby(); as data) {
            <div class="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs text-black">
              <pre>{{ data | json }}</pre>
            </div>
          } @else {
            <p class="text-gray-500">Loading...</p>
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class BackofficeTestComponent {
  // Services
  private bannersService = inject(BannersService);
  private footersService = inject(FootersService);
  private categoriesService = inject(CategoriesService);
  private menusService = inject(MenusService);
  private showcasesService = inject(ShowcasesService);
  private slotsService = inject(SlotsService);
  private topListsService = inject(TopListsService);
  private topWinnersService = inject(TopWinnersService);
  private awardsService = inject(AwardsService);
  private settingsService = inject(SettingsService);
  private lobbiesService = inject(LobbiesService);

  // Signals for data
  banners = toSignal(this.bannersService.getBanners().pipe(catchError((e) => of({ err: e.message }))));
  footers = toSignal(this.footersService.getFooters().pipe(catchError((e) => of({ err: e.message }))));
  categories = toSignal(this.categoriesService.getCategories().pipe(catchError((e) => of({ err: e.message }))));
  menus = toSignal(this.menusService.getMenus().pipe(catchError((e) => of({ err: e.message }))));
  showcases = toSignal(this.showcasesService.getShowcases().pipe(catchError((e) => of({ err: e.message }))));
  slots = toSignal(this.slotsService.getSlots().pipe(catchError((e) => of({ err: e.message }))));
  topLists = toSignal(this.topListsService.getTopLists().pipe(catchError((e) => of({ err: e.message }))));
  topWinners = toSignal(this.topWinnersService.getBatches().pipe(catchError((e) => of({ err: e.message }))));
  awards = toSignal(this.awardsService.getBatches().pipe(catchError((e) => of({ err: e.message }))));
  settings = toSignal(this.settingsService.getPublicSettings().pipe(catchError((e) => of({ err: e.message }))));
  casinoLobby = toSignal(this.lobbiesService.getCasinoLobby().pipe(catchError((e) => of({ err: e.message }))));
  liveLobby = toSignal(this.lobbiesService.getLiveLobby().pipe(catchError((e) => of({ err: e.message }))));
}
