import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MessagesGateway } from '../messages.gateway';
import { MessageState, PlayerMessage, PopupMessage } from '../messages.models';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/**
 * `MessagesGateway` with no backend at all: a small inbox in `localStorage` and no popups.
 *
 * Same job as the other demo adapters, and the one that finally lets the published demo answer
 * every call the app makes. No popups on purpose: a demo that opens a dialog over the first screen
 * a visitor sees is a worse demo, and the inbox already shows what the feature looks like.
 *
 * A production build refuses this adapter.
 */
@Injectable()
export class DemoMessagesGateway implements MessagesGateway {
  private static readonly STORAGE_KEY = 'demo-messages';

  getMessages(): Observable<PlayerMessage[]> {
    return this.answer(this.read());
  }

  getUnreadCount(): Observable<number> {
    return this.answer(this.read().filter((message) => message.state === MessageState.Unread).length);
  }

  /** None. See the class comment: the demo does not interrupt the visitor. */
  getPopups(): Observable<PopupMessage[]> {
    return this.answer([] as PopupMessage[]);
  }

  markAsRead(messageId: number): Observable<void> {
    this.write(
      this.read().map((message) => (message.id === messageId ? { ...message, state: MessageState.Read } : message)),
    );

    return this.answer(undefined);
  }

  deleteMessage(messageId: number): Observable<void> {
    this.write(this.read().filter((message) => message.id !== messageId));

    return this.answer(undefined);
  }

  /** Nothing to tell anybody: the demo has no popup to have pressed a button on. */
  resolveAction(): Observable<void> {
    return this.answer(undefined);
  }

  private answer<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }

  private read(): PlayerMessage[] {
    try {
      const stored = localStorage.getItem(DemoMessagesGateway.STORAGE_KEY);
      if (stored) return JSON.parse(stored);

      const seeded = seedInbox();
      localStorage.setItem(DemoMessagesGateway.STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    } catch {
      // A browser with storage blocked still gets an inbox, just not a durable one.
      return seedInbox();
    }
  }

  private write(messages: PlayerMessage[]): void {
    try {
      localStorage.setItem(DemoMessagesGateway.STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // See above: nothing to do, the next read seeds a fresh inbox.
    }
  }
}

/**
 * Three messages: one unread, so the badge has a number in it, and two read, so the screen has
 * both states to draw. Seeded on the first read and written, the same as the demo statement.
 */
function seedInbox(): PlayerMessage[] {
  return [
    {
      id: 3,
      title: 'Seu depósito foi confirmado',
      contents: '<p>Recebemos seu depósito e o saldo já está disponível para jogar. Boa sorte!</p>',
      createdAt: hoursAgo(3).toISOString(),
      state: MessageState.Unread,
    },
    {
      id: 2,
      title: 'Rodadas grátis liberadas',
      contents: '<p>Você ganhou <b>20 rodadas grátis</b>. Elas expiram em sete dias.</p>',
      createdAt: hoursAgo(30).toISOString(),
      state: MessageState.Read,
    },
    {
      id: 1,
      title: 'Bem-vindo',
      contents: '<p>Sua conta está pronta. Qualquer dúvida, fale com a gente pelo chat.</p>',
      createdAt: hoursAgo(72).toISOString(),
      state: MessageState.Read,
    },
  ];
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 3600 * 1000);
}
