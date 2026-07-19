import { eventBus, type AdjustConfigurationPayload } from '@/core/event-bus'
import { useConfigurationStore } from '@/stores/configuration';

function onAdjustConfiguration(payload: AdjustConfigurationPayload) {
  const configStore = useConfigurationStore()
  configStore.set(payload.key, payload.value, payload.type)

  // some of components need an rules - we need additional store for menu widget
  // to get thge right menu after critical change in configuration.

  // next step: provide API to get the MENU JSON!
}

export function registerActions(): void {
  eventBus.on('conf:adjust', onAdjustConfiguration)
}
