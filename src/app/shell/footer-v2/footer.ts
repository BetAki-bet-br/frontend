import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';

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
})
export class Footer {
  private readonly tawkMessengerService = inject(TawkToScriptService);
  linkColumns: LinkColumn[] = [
    {
      title: 'Sobre a Bet Aki',
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
        { text: 'Blog', url: '#' },
        { text: 'Central de Ajuda', url: '/customer-support' },
        { text: 'Canais de Atendimento', url: '/contact' },
      ],
    },
    {
      title: 'Aposte',
      links: [
        { text: 'Aposta Esportiva', url: '#' },
        { text: 'Esportes Ao Vivo', url: '#' },
        { text: 'Jogos Slots', url: '#' },
        { text: 'Jogos Ao Vivo', url: '#' },
      ],
    },
  ];

  socialIcons: SocialIcon[] = [
    {
      alt: 'Instagram icone',
      src: '/assets/icons/instagram-icon.svg',
      url: '#',
      width: 18,
      height: 18,
    },
    {
      alt: 'Telegram icone',
      src: '/assets/icons/telegram-icon.svg',
      url: '#',
      width: 18,
      height: 16,
    },
    {
      alt: 'TikTok icone',
      src: '/assets/icons/tiktok-icon.svg',
      url: '#',
      width: 18,
      height: 20,
    },
    {
      alt: 'Facebook icone',
      src: '/assets/icons/facebook-icon.svg',
      url: '#',
      width: 18,
      height: 34,
    },
  ];

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
    { name: 'Denúncias', url: '' },
    { name: 'Privacidade', url: '/privacy-policy' },
  ];

  openTawkChat(): void {
    this.tawkMessengerService.maximize();
  }
}
