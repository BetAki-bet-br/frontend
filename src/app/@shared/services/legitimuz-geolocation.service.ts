import { Injectable } from '@angular/core';

declare global {
  interface Window {
    LegitimuzAntiFraude: any;
  }
}

export enum LegitimuzGeolocationAction {
  SignIn = 'signin',
  Register = 'signup',
  Check = 'check',
}

@Injectable({
  providedIn: 'root',
})
export class LegitimuzGeolocationService {
  private sdkInstance: any;
  private scriptLoaded = false;

  constructor() {}

  public initialize(action: LegitimuzGeolocationAction, token: string): void {
    if (!window.LegitimuzAntiFraude) {
      console.error('SDK is not loaded yet.');
      return;
    }

    this.sdkInstance = window.LegitimuzAntiFraude({
      apiURL: 'https://api.legitimuz.com',
      token,
      action: action,
      enableRequestGeolocation: true,
    });

    this.sdkInstance.mount();

    console.log('Legitimuz SDK initialized.');
  }
  public sendAnalysis(data: { cpf: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.sdkInstance) {
        reject('SDK not initialized. Call initialize() first.');
        return;
      }

      try {
        this.sdkInstance.sendAnalisys(data, (err: any, result: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  public changeAction(action: LegitimuzGeolocationAction) {
    if (!this.sdkInstance) {
      console.error('SDK is not loaded yet.');
      return;
    }

    this.sdkInstance.setAction(action);
  }
}
