import { MenuPlugin } from "@/plugins/menu-plugin.ts";
import { registerActions } from "@/actions/register.ts";
import { widgetRegistry, pluginManager, layoutRegistry } from "./../core/runtime.ts";

export function register(): void {
    const context = {
        widgets: widgetRegistry,
        layouts: layoutRegistry
    }

    pluginManager.register(
        new MenuPlugin()
    )

    pluginManager.initialize(context)

    registerActions()

    layoutRegistry.register({
        id: 'dashboard',
        columns: '1fr 250px',
        rows: '60px 1fr',
        gridTemplateAreas: [
            'header header',
            'content sidebar'
        ]
    })

    layoutRegistry.activate('dashboard');
}
