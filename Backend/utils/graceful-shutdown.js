


export function setupGracefulShutdown({ onShutdown, timeout = 30000, server }) {
  const shutdown = async (signal) => {
    console.log(`Received ${signal}, starting graceful shutdown...`);

    
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
      });
    }

    
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

  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}
