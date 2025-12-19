import { TemplateRef } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export function getDesktopTableColumns(
  usernameTemplate: TemplateRef<any> | undefined,
  currencyTemplate: TemplateRef<any> | undefined
) {
  return [
    {
      name: marker('Game'),
      dataField: 'gameName',
      sortingField: 'gameName',
    },
    {
      name: marker('User'),
      dataField: 'user',
      sortingField: 'user',
      columnTemplate: usernameTemplate,
    },

    // TODO removed at the moment (API issues)
    // {
    //   name: marker('Bet amount'),
    //   dataField: 'betAmount',
    //   sortingField: 'betAmount',
    //   columnTemplate: currencyTemplate,
    // },
    // {
    //   name: marker('Multiplier'),
    //   dataField: 'multiplierResolved',
    //   sortingField: 'multiplier',
    // },
    {
      name: marker('Payout'),
      dataField: 'payoutAmount',
      sortingField: 'payoutAmount',
      columnTemplate: currencyTemplate,
    },
  ];
}

export function getMobileTableColumns(
  gameTemplate: TemplateRef<any> | undefined,
  betAmountTemplate: TemplateRef<any> | undefined,
  currencyTemplate: TemplateRef<any> | undefined
) {
  return [
    {
      name: marker('Game'),
      dataField: 'gameName',
      sortingField: 'gameName',
      columnTemplate: gameTemplate,
    },
    // TODO removed at the moment (API issues)
    // {
    //   name: marker('Bet amount'),
    //   dataField: 'betAmount',
    //   sortingField: 'betAmount',
    //   columnTemplate: betAmountTemplate,
    // },
    {
      name: marker('Payout'),
      dataField: 'payoutAmount',
      sortingField: 'payoutAmount',
      columnTemplate: currencyTemplate,
    },
  ];
}
