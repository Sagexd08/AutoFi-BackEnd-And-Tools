import type { Plugin, PluginRegistry, SDKConfig } from '../types/config';
import { SDKError } from '../errors';
import { ERROR_CODES } from '../constants/errors';

/**
 * Plugin registry implementation.
 */
export class DefaultPluginRegistry implements PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private initialized = false;

  /**
   * Registers a plugin.
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.name)) {
      throw new SDKError(
        ERROR_CODES.CONFIGURATION_ERROR,
        `Plugin "${plugin.metadata.name}" is already registered`,
        { recoverable: false }
      );
    }

    // Check dependencies
    this.validateDependencies(plugin);

    this.plugins.set(plugin.metadata.name, plugin);
  }

  /**
   * Unregisters a plugin.
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      this.plugins.delete(name);
      // Check if other plugins depend on this one
      this.validateDependents(name);
    }
  }

  /**
   * Gets a plugin by name.
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Gets all registered plugins.
   */
  getAll(): readonly Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Initializes all plugins in dependency order.
   */
  async initializeAll(config: SDKConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    const sortedPlugins = this.sortByDependencies();

    for (const plugin of sortedPlugins) {
      if (plugin.onInit) {
        try {
          await plugin.onInit(config);
        } catch (error) {
          throw new SDKError(
            ERROR_CODES.CONFIGURATION_ERROR,
            `Failed to initialize plugin "${plugin.metadata.name}"`,
            { cause: error instanceof Error ? error : new Error(String(error)) }
          );
        }
      }
    }

    this.initialized = true;
  }

  /**
   * Starts all plugins.
   */
  async startAll(): Promise<void> {
    const sortedPlugins = this.sortByDependencies();

    for (const plugin of sortedPlugins) {
      if (plugin.onStart) {
        try {
          await plugin.onStart();
        } catch (error) {
          throw new SDKError(
            ERROR_CODES.CONFIGURATION_ERROR,
            `Failed to start plugin "${plugin.metadata.name}"`,
            { cause: error instanceof Error ? error : new Error(String(error)) }
          );
        }
      }
    }
  }

  /**
   * Stops all plugins in reverse dependency order.
   */
  async stopAll(): Promise<void> {
    const sortedPlugins = this.sortByDependencies().reverse();

    for (const plugin of sortedPlugins) {
      if (plugin.onStop) {
        try {
          await plugin.onStop();
        } catch (error) {
          // Log error but continue stopping other plugins
          console.error(`Error stopping plugin "${plugin.metadata.name}":`, error);
        }
      }
    }
  }

  /**
   * Destroys all plugins in reverse dependency order.
   */
  async destroyAll(): Promise<void> {
    const sortedPlugins = this.sortByDependencies().reverse();

    for (const plugin of sortedPlugins) {
      if (plugin.onDestroy) {
        try {
          await plugin.onDestroy();
        } catch (error) {
          // Log error but continue destroying other plugins
          console.error(`Error destroying plugin "${plugin.metadata.name}":`, error);
        }
      }
    }

    this.plugins.clear();
    this.initialized = false;
  }

  /**
   * Validates plugin dependencies.
   */
  private validateDependencies(plugin: Plugin): void {
    const deps = plugin.metadata.dependencies;
    if (!deps) {
      return;
    }

    // Check required dependencies
    if (deps.requires) {
      for (const depName of deps.requires) {
        if (!this.plugins.has(depName)) {
          throw new SDKError(
            ERROR_CODES.CONFIGURATION_ERROR,
            `Plugin "${plugin.metadata.name}" requires plugin "${depName}" which is not registered`,
            { recoverable: false }
          );
        }
      }
    }

    // Warn about optional dependencies
    if (deps.optional) {
      for (const depName of deps.optional) {
        if (!this.plugins.has(depName)) {
          console.warn(
            `Plugin "${plugin.metadata.name}" has optional dependency "${depName}" which is not registered`
          );
        }
      }
    }
  }

  /**
   * Validates that no plugins depend on the given plugin.
   */
  private validateDependents(pluginName: string): void {
    for (const plugin of this.plugins.values()) {
      const deps = plugin.metadata.dependencies;
      if (deps?.requires?.includes(pluginName)) {
        console.warn(
          `Plugin "${plugin.metadata.name}" depends on "${pluginName}" which was unregistered`
        );
      }
    }
  }

  /**
   * Sorts plugins by dependency order using topological sort.
   */
  private sortByDependencies(): Plugin[] {
    const plugins = Array.from(this.plugins.values());
    const sorted: Plugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: Plugin): void => {
      if (visiting.has(plugin.metadata.name)) {
        throw new SDKError(
          ERROR_CODES.CONFIGURATION_ERROR,
          `Circular dependency detected involving plugin "${plugin.metadata.name}"`,
          { recoverable: false }
        );
      }

      if (visited.has(plugin.metadata.name)) {
        return;
      }

      visiting.add(plugin.metadata.name);

      const deps = plugin.metadata.dependencies?.requires;
      if (deps) {
        for (const depName of deps) {
          const dep = this.plugins.get(depName);
          if (dep) {
            visit(dep);
          }
        }
      }

      visiting.delete(plugin.metadata.name);
      visited.add(plugin.metadata.name);
      sorted.push(plugin);
    };

    for (const plugin of plugins) {
      if (!visited.has(plugin.metadata.name)) {
        visit(plugin);
      }
    }

    return sorted;
  }
}
