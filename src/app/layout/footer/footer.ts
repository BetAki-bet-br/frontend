import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TawkMessengerService } from '../../shared/tawk/tawk-messenger.service';

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

@Component({
  selector: 'app-footer',
  imports: [NgOptimizedImage, NgClass],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly tawkMessengerService = inject(TawkMessengerService);
  linkColumns: LinkColumn[] = [
    {
      title: 'Sobre o BetAki',
      links: [
        { text: 'Termos e Condições', url: '#' },
        { text: 'Jogo Responsável', url: '#' },
        { text: 'Política de Privacidade', url: '#' },
        { text: 'Política AML', url: '#' },
      ],
    },
    {
      title: 'Comunidade',
      links: [
        { text: 'Promoções', url: '#' },
        { text: 'Blog', url: '#' },
        { text: 'Central de Ajuda', url: '#' },
        { text: 'Canais de Atendimento', url: '#' },
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

  supportOptions: string[] = ['Ouvidoria', 'Denúncias', 'Privacidade'];

  openTawkChat(): void {
    this.tawkMessengerService.openChat();
  }
}
