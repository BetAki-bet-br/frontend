import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { BRAND } from '@app/@core/brand';

interface Link {
  text: string;
  url: string;
}

interface LinkColumn {
  title: string;
  links: Link[];
}

interface SocialIcon {
  alt: string;
  src: string;
  url: string;
  width: number;
  height: number;
}

interface CertificationImage {
  src: string;
  alt: string;
  class: string;
  width?: number;
  height?: number;
}

interface SupportOption {
  name: string;
  url: string;
}

/** One official seal of the regulatory footer, with the page it links to. */
interface RegulatorySeal {
  src: string;
  alt: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Footer of the shell, in the composition the brand asked for.
 *
 * `layout.footer = 'columns'` (default) is the classic stack: link columns, logo and socials,
 * sponsors, seals, disclaimer. `regulatory` reorders the same data into the wide regulated-market
 * shape: brand and responsible-gaming copy first, link columns beside it, then the disclaimer and
 * a closing row of socials and copyright. Nothing here is brand copy except what comes off
 * `BRAND`, and no colour is named outside the theme tokens.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  private readonly tawkMessengerService = inject(TawkToScriptService);
  private readonly brand = inject(BRAND);

  /** `regulatory` composition (Superbet); `columns` is the default everywhere else. */
  readonly isRegulatory = this.brand.layout.footer === 'regulatory';

  readonly brandName = this.brand.name;
  readonly copyright = `© ${new Date().getFullYear()} ${this.brand.name}. Todos os direitos reservados.`;

  /**
   * Bottom clearance of the last row on mobile: the bottom navigation, plus the 57px sticky
   * account bar when the brand mounts one above it.
   */
  readonly bottomClearance = this.brand.layout.mobileAccountBar ? 'pb-[145px]' : 'pb-22';

  readonly brandLogo = this.brand.assets.logoColor;
  readonly brandSupportIcon = this.brand.assets.icons.support;
  readonly sponsors = this.brand.sponsors;
  readonly sponsorHeading = `A ${this.brand.name} tem orgulho em patrocinar:`;
  readonly legalDisclaimer = this.brand.legal.disclaimer;

  linkColumns: LinkColumn[] = [
    {
      title: `Sobre a ${this.brand.name}`,
      links: [
        { text: 'Termos e Condições', url: '/terms-and-conditions' },
        { text: 'Jogo Responsável', url: '/rgl' },
        { text: 'Política de Privacidade', url: '/privacy-policy' },
        { text: 'Política AML', url: '/aml-policy' },
      ],
    },
    {
      title: 'Comunidade',
      links: [
        { text: 'Promoções', url: '/promotions' },
        { text: 'Canais de atendimento', url: '/customer-support' },
      ],
    },
    {
      title: 'Aposte',
      links: [
        { text: 'Aposta Esportiva', url: '/' },
        { text: 'Esportes Ao Vivo', url: '/sportsbook-live' },
        { text: 'Jogos Slots', url: '/games' },
        { text: 'Jogos Ao Vivo', url: '/games/live' },
      ],
    },
  ];

  /** One entry per network the brand declares; networks absent from `BRAND.social` are dropped. */
  socialIcons: SocialIcon[] = (
    [
      // src\assets\general\icons\instagram-color.svg
      {
        alt: 'Instagram',
        src: '/assets/general/icons/instagram-color.svg',
        url: this.brand.social.instagram,
        width: 18,
        height: 18,
      },
      {
        alt: 'Telegram',
        src: '/assets/icons/telegram-color.svg',
        url: this.brand.social.telegram,
        width: 18,
        height: 16,
      },
      {
        alt: 'TikTok',
        src: '/assets/icons/tiktok-icon.svg',
        url: this.brand.social.tiktok,
        width: 18,
        height: 20,
      },
      {
        alt: 'Facebook',
        src: '/assets/icons/facebook-color.svg',
        url: this.brand.social.facebook,
        width: 18,
        height: 34,
      },
      {
        alt: 'X (Twitter)',
        src: '/assets/icons/x-icon.svg',
        url: this.brand.social.twitter,
        width: 18,
        height: 34,
      },
    ] as (Omit<SocialIcon, 'url'> & { url?: string })[]
  ).filter((icon): icon is SocialIcon => !!icon.url);

  certificationImages: CertificationImage[] = [
    {
      src: '/assets/footer/gaming-labs.png',
      alt: 'Gaming Labs logo',
      class: 'h-8 md:h-10 w-auto',
      width: 140,
      height: 64,
    },
    {
      src: '/assets/footer/gordon-moody.png',
      alt: 'Gordon Moody logo',
      class: 'h-6 md:h-8 w-auto',
      width: 140,
      height: 44,
    },
    {
      src: '/assets/footer/jogue-com-responsabilidade.png',
      alt: 'Responsabilidade logo',
      class: 'h-6 md:h-8 w-auto',
      width: 140,
      height: 29,
    },
    {
      src: '/assets/footer/be-gamble-aware.png',
      alt: 'Be Gamble Aware logo',
      class: 'h-10 md:h-12 w-auto',
      width: 140,
      height: 26,
    },
    {
      src: '/assets/footer/ibia.png',
      alt: 'IBIA logo',
      class: 'h-8 md:h-10 w-auto',
      width: 140,
      height: 54,
    },
  ];

  /**
   * The three official seals. The classic footer keeps its own inline copy of this markup so its
   * DOM stays frozen for the brands that ship it; only the regulatory composition reads this list.
   */
  regulatorySeals: RegulatorySeal[] = [
    {
      src: '/assets/footer/autorizado.png',
      alt: 'Autorizado pelo ministério da fazenda logo',
      url: 'https://www.editoraroncarati.com.br/v2/Diario-Oficial/Diario-Oficial/PORTARIA-SPA-MF-N%C2%BA-693-DE-01-04-2025.html',
      width: 150,
      height: 44,
    },
    {
      src: '/assets/footer/reclame-aqui.png',
      alt: 'Selo Reclame Aqui',
      url: 'https://www.reclameaqui.com.br/empresa/bet-aki/?utm_source=referralutm_medium=embbed&utm_campaign=ra_verificada&utm_term=horizontal',
      width: 200,
      height: 71,
    },
    {
      src: '/assets/footer/direito-consumidor.png',
      alt: 'Aqui respeitamos o consumidor',
      url: 'https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor/Anexos/cdc-portugues-2013.pdf',
      width: 200,
      height: 71,
    },
  ];

  supportOptions: SupportOption[] = [
    { name: 'Ouvidoria', url: '/customer-support' },
    { name: 'Privacidade', url: '/privacy-policy' },
  ];

  openTawkChat(): void {
    this.tawkMessengerService.maximize();
  }
}
