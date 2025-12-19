import { Pipe, PipeTransform } from '@angular/core';
import { GameProviderData } from '@app/@shared/models';

@Pipe({
  name: 'supplierNameTransform',
})
export class SupplierNameTransformPipe implements PipeTransform {
  transform(provider: GameProviderData): string {
    const words = provider.name.split(' ');

    // If the first word is "Alea" or "Relax" remove it from the array. Skip removal for productId 40000 (Relax Gaming)
    if (
      words.length > 1 &&
      (words[0] === 'Alea' || words[0] === 'Hub88' || (provider.id !== 40000 && words[0] === 'Relax'))
    ) {
      words.shift();
    }

    // If there are still more than one word, remove the last word
    if (words.length > 1) {
      words.pop();
    }

    // Combine the remaining words with spaces to form the new name
    const newName = words.join(' ');

    return newName;
  }
}
