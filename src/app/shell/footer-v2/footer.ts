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

  readonly brandLogo = this.brand.assets.logoColor;
  readonly brandSupportIcon = this.brand.assets.icons.support;
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

  supportOptions: SupportOption[] = [
    { name: 'Ouvidoria', url: '/customer-support' },
    { name: 'Privacidade', url: '/privacy-policy' },
  ];

  openTawkChat(): void {
    this.tawkMessengerService.maximize();
  }
}
