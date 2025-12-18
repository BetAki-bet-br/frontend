export interface VipProgram {
  id: number;
  name: string;
  min: number;
  max?: number;
  prizeAmount?: number;
  percentageAmount?: number;
  wager: number;
  freeSpinsPrize: number;
}
