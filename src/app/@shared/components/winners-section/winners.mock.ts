import { GameTile, Player, Round, WinnersItem } from '@app/@shared/models';
import { GameWinner } from '@app/@shared/models/winners-item.model';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBet(): number {
  return parseFloat((Math.random() * 100).toFixed(2)); // random bet between 0 and 100
}

function getRandomWin(): number {
  return parseFloat((Math.random() * 1000).toFixed(2)); // random win between 0 and 1000
}

function getRandomCurrency(): string {
  const currencies = ['NZS$'];
  return currencies[getRandomInt(0, currencies.length - 1)];
}

function getRandomGame(games: GameTile[]): GameWinner {
  const gameRandom = games[getRandomInt(0, games.length - 1)];

  const gameMapped: GameWinner = {
    identifier: gameRandom.externalGameId ?? '',
    title: gameRandom.gameName ?? '',
    table_image_path: gameRandom.gameDesktopAssetPath ?? '',
  };
  return gameMapped;
}

function getRandomPlayer(): Player {
  const nicknames = [
    'QpoyAMrmg',
    'Snuu0z2',
    'XzrkJIvu8',
    'rkgmYS',
    'DKyHPJXxm',
    'ANlhPUA',
    'bZQ1kV',
    'wYJp0dUd',
    'vkiYYrbIk',
    'phXFzjZEW',
    'QMPsjBbX9A',
    'QdRMwdBOyD',
    'OfgL19',
    'XdYHQiwgkV',
    'xJQGnY62y',
    'jwQtGg2QW',
    'wIDBMWcs4',
    'ZKaaQyl',
    'uUwlk9C',
    'POVK1bcQ',
    'kaD25ctS',
    'tztNpI',
    'cLZqXNUd',
    'wouAVNEH',
    'HysMAMiT',
    'AUOaiZYb',
    'wUAOe0uC5',
    'JRyjXKYSFy',
    'luA5WUA4',
    'UlChCRNKz',
    'aCOGxkH',
    'QgyDNp',
    'ukcHA9vk',
    'xUiUm7Tmw',
    'zmYEW2aL',
    'abYeTnP',
    'CvxQqEx9',
    'tuDPb2Ogfg',
    'yMXoIh',
    'kPlBGRoU',
    'ECfiDHJa',
    'cjzC4Lc',
    'yur2F7g',
    'KtipCjjG',
    'OoVkbJDM',
    'DcDwcC6',
    'knuzQB',
    'ZQGclwf7C',
    'xgrcixnZ',
    'oEKNlYH8',
    'haGOJm',
    'qyKgvyguT',
    'QSptkNDWw',
    'LCPWh8o',
    'bOxmiu6',
    'jAmTqpIs',
    'lRsYokG2',
    'vyCcDRB',
    'rLA4B6QA',
    'ZFZ8ie',
    'KvNuY8',
    'QsUPGv3e',
    'SPvoOjGds0',
    'rLPmq8r7K',
    'ffhBCgb4yu',
    'IIgvoSo',
    'Qzegh0Ys',
    'veMBIFv',
    'EQkwBIro',
    'vIdvxUjy4',
    'UfVmLfk8',
    'hAwCMft',
    'eKyjSaDk5',
    'UXYoM7tm',
    'BeCkXuM',
    'kflxS6',
    'ElpOCjbLl',
    'jUcQHxEC',
    'xLgi8dVeQ',
    'nkWMB0rL',
    'BebqGvZh',
    'StTuv8Sz',
    'Sgf3tGcS',
    'cbSLIFVShg',
    'qcVrV8Qlf',
    'vHEoEAYs',
    'HoixxwyH',
    'OKYXng',
    'rXqAqJ',
    'jhTRrt9w',
    'eWsDnmP',
    'LSZfiBjt',
    'HfhH4iAS',
  ];

  return { nickname: nicknames[getRandomInt(0, nicknames.length - 1)] };
}

function getRandomRound(): Round {
  return {
    currency: getRandomCurrency(),
    bet: getRandomBet(),
    win: getRandomWin(),
  };
}

export function generateRandomWinnersItems(count: number, games: GameTile[]): WinnersItem[] {
  const winnersItems: WinnersItem[] = [];
  for (let i = 0; i < count; i++) {
    const game = getRandomGame(games);
    const player = getRandomPlayer();
    const round = getRandomRound();
    winnersItems.push({ game, player, round });
  }
  return winnersItems;
}
