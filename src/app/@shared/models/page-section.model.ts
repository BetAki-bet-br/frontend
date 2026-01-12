import { SectionType } from './section-type.model';

export interface PageSection {
  id: string | number;
  type: SectionType;
  gameCount?: number;
  data: any;
}
