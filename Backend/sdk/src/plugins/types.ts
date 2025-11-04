import type { SDKConfig } from '../types/config';

/**
 * Plugin lifecycle hooks.
 */
export interface PluginLifecycle {
  /**
   * Called when plugin is initialized.
   */
  onInit?(config: SDKConfig): void | Promise<void>;

  /**
   * Called when plugin is started.
   */
  onStart?(): void | Promise<void>;

  /**
   * Called when plugin is stopped.
   */
  onStop?(): void | Promise<void>;

  /**
   * Called when plugin is destroyed.
   */
  onDestroy?(): void | Promise<void>;
}

/**
 * Plugin dependencies.
 */
export interface PluginDependencies {
  /** Required plugin names */
  requires?: readonly string[];
  /** Optional plugin names */
  optional?: readonly string[];
}

/**
 * Plugin metadata.
 */
export interface PluginMetadata {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description?: string;
  /** Plugin dependencies */
  dependencies?: PluginDependencies;
}

/**
 * Plugin interface.
 */
export interface Plugin extends PluginLifecycle {
  /** Plugin metadata */
  metadata: PluginMetadata;
}

/**
 * Plugin registry interface.
 */
export interface PluginRegistry {
  /**
   * Registers a plugin.
   */
  register(plugin: Plugin): void;

  /**
   * Unregisters a plugin.
   */
  unregister(name: string): void;

  /**
   * Gets a plugin by name.
   */
  get(name: string): Plugin | undefined;

  /**
   * Gets all registered plugins.
   */
  getAll(): readonly Plugin[];

  /**
   * Initializes all plugins.
   */
  initializeAll(config: SDKConfig): Promise<void>;

  /**
   * Starts all plugins.
   */
  startAll(): Promise<void>;

  /**
   * Stops all plugins.
   */
  stopAll(): Promise<void>;

  /**
   * Destroys all plugins.
   */
  destroyAll(): Promise<void>;
}
