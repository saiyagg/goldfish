import integrateLifeCycleMethods from './integrateLifeCycleMethods';
import AppSetup from './setup/AppSetup';
import { AppStore, createApp } from '@alipay/goldfish';
import integrateSetupFunctionResult, { ISetupFunction } from './integrateSetupFunctionResult';
import { PluginClass } from '@alipay/goldfish-plugins';
import { attachLogic, AppInstance, observable } from '@alipay/goldfish-reactive-connect';
import appendFn from './appendFn';

interface IAppInstance extends tinyapp.IAppInstance<any> {
  $setup: AppSetup;
  stopWatchFeedback: () => void;
}

export interface ISetupAppOptions {
  plugins?: PluginClass[];
}

export default function setupApp(
  fn: ISetupFunction,
  setupOptions?: ISetupAppOptions,
): tinyapp.AppOptions {
  const options = integrateLifeCycleMethods<'app'>([
    'onLaunch',
    'onShow',
    'onHide',
    'onError',
    'onShareAppMessage',
  ]);

  attachLogic<'onLaunch', Required<tinyapp.AppOptions>['onLaunch']>(
    options,
    'onLaunch',
    'before',
    async function (this: AppInstance<any, AppStore>) {
      const store = this.store!;
      await store.waitForReady();
      // TODO: Feedback
    },
  );

  type View = AppInstance<any, AppStore> & { $setup?: AppSetup };

  let view: View;

  @observable
  class BizAppStore extends AppStore {
    public constructor() {
      super();
      integrateSetupFunctionResult<'app'>(fn, view.$setup!, view, this);
    }

    public getPlugins() {
      if (!setupOptions || !setupOptions.plugins) {
        return super.getPlugins();
      }
      return setupOptions.plugins;
    }

    public async fetchInitData() {
      await super.fetchInitData();
      const fn = view.$setup!.getFetchInitDataMethod();
      fn && await fn();
    }
  }

  createApp(
    BizAppStore,
    options,
    {
      beforeCreateStore: (v: View) => {
        const setup = new AppSetup();
        v.$setup = setup;
        view = v;

        setup.iterateMethods((fns, name) => {
          appendFn(v, name, fns);
        });
      },
    },
  );

  return options;
}