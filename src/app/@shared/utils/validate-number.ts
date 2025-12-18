import { Keyboard } from './keyboard';

const allowed = [
  Keyboard.Keys.Backspace,
  Keyboard.Keys.ArrowLeft,
  Keyboard.Keys.ArrowRight,
  Keyboard.Keys.Digit0,
  Keyboard.Keys.Digit1,
  Keyboard.Keys.Digit2,
  Keyboard.Keys.Digit3,
  Keyboard.Keys.Digit4,
  Keyboard.Keys.Digit5,
  Keyboard.Keys.Digit6,
  Keyboard.Keys.Digit7,
  Keyboard.Keys.Digit8,
  Keyboard.Keys.Digit9,
];

export function validateNumber(event: KeyboardEvent) {
  if (allowed.includes(event.key as Keyboard.Keys)) {
    return true;
  }

  // Allow copy (Ctrl+C) and paste (Ctrl+V)
  if (event.ctrlKey && (event.key === 'c' || event.key === 'v')) {
    return true;
  }

  return false;
}
