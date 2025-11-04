/**
 * Graceful shutdown handler for the application.
 */

/**
 * Sets up graceful shutdown handlers.
 * 
 * @param {Object} options - Shutdown options
 * @param {Function} options.onShutdown - Function to call on shutdown
 * @param {number} options.timeout - Shutdown timeout in milliseconds
 * @param {Object} options.server - HTTP server instance
 */
export function setupGracefulShutdown({ onShutdown, timeout = 30000, server }) {
  const shutdown = async (signal) => {
    console.log(`Received ${signal}, starting graceful shutdown...`);

    // Close HTTP server
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
      });
    }

    // Call custom shutdown handler
    if (onShutdown) {
      try {
        await Promise.race([
          onShutdown(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
          ),
        ]);
        console.log('Shutdown completed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    } else {
      process.exit(0);
    }
  };

  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}
