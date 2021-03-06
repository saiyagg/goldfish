import InitData from './InitData';
import {
  PluginHub,
  IConfig,
} from '@goldfishjs/plugins';
import { reactive } from '@goldfishjs/composition-api';

export interface IInitOptions<D> {
  data?: D;
  config?: IConfig;
}

export default class Global {
  public initData = new InitData();

  private pluginHub = new PluginHub();

  public data: any = undefined;

  public config: Record<string, any> = {};

  public reactiveData: { data: Record<string, any> } = reactive({ data: {} });

  public normalData: Record<string, any> = {};

  public destroyList: (() => void)[] = [];

  public init<D extends Record<string, any>>(options: IInitOptions<D> = {}) {
    this.data = reactive(options.data || {});
    this.config = options.config || {};
  }

  public destroy() {
    this.destroyList.forEach(s => s());
    this.pluginHub.destroy();
  }
}

export const global = new Global();
