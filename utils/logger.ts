
export const logger = {

    info: (message: string) => console.log(`INFO: ${message}`),
  
    error: (message: string, error: unknown) => console.error(`ERROR: ${message}`, error),
    
    warn: (message: string) => {
        console.warn(`WARN: ${message}`);
    },

    debug: (message: string) => {
        console.debug(`DEBUG: ${message}`);
    }

};
  

