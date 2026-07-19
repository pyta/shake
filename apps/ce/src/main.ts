import { defineCustomElement } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import { register } from './setup/register.ts';
import { define } from './setup/define.ts';

const pinia = createPinia()
setActivePinia(pinia)

register();
define();

const AppElement = defineCustomElement(App, {
  configureApp(app) {
    app.use(pinia)
  },
})

customElements.define('shake-app', AppElement)

export function mount(id: string) {
  const target = document.getElementById(id)
  if (!target) {
    throw new Error(`Element #${id} not found`)
  }

  target.replaceChildren(document.createElement('shake-app'))
}
