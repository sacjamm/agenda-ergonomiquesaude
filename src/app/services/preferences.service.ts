import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  constructor() {}

  async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }

  async logout(): Promise<void> {
    await this.remove('token');
    await this.remove('usuario');
    // Adicione outros dados que desejar limpar no logout
  }

  async getUsuarioLogado(): Promise<any | null> {
    return this.get('usuario');
  }

  async getLoginData(): Promise<any | null> {
    return this.get('login_data');
  }
}