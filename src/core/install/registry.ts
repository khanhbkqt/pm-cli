import type { ClientType, ClientAdapter } from './types.js';

/**
 * Lazy factory registry for client adapters.
 *
 * Each adapter registers itself with a factory function that is called
 * on first access. This avoids importing all adapters at startup.
 */
const adapterFactories = new Map<ClientType, () => ClientAdapter>();
const adapterInstances = new Map<ClientType, ClientAdapter>();

/**
 * Register an adapter factory for a client type.
 * Adapters call this at module load time.
 */
export function registerAdapter(type: ClientType, factory: () => ClientAdapter): void {
    adapterFactories.set(type, factory);
}

/**
 * Get the adapter for a specific client type.
 * Lazily instantiates the adapter on first call.
 *
 * @throws Error if no adapter is registered for the given type.
 */
export function getAdapter(type: ClientType): ClientAdapter {
    let adapter = adapterInstances.get(type);
    if (adapter) return adapter;

    const factory = adapterFactories.get(type);
    if (!factory) {
        throw new Error(`No adapter registered for client type: '${type}'`);
    }

    adapter = factory();
    adapterInstances.set(type, adapter);
    return adapter;
}

/**
 * Get all registered adapters, instantiating any that haven't been yet.
 */
export function getAllAdapters(): ClientAdapter[] {
    for (const [type, factory] of adapterFactories) {
        if (!adapterInstances.has(type)) {
            adapterInstances.set(type, factory());
        }
    }
    return Array.from(adapterInstances.values());
}
