/**
 * Plugin system for the SDK.
 * 
 * Provides plugin architecture with lifecycle hooks, dependency management,
 * and plugin registry for extending SDK functionality.
 */

export * from './types';
export * from './plugin-registry';

export { DefaultPluginRegistry } from './plugin-registry';
