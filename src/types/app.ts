/**
 * The layers of our application.
 */
export type TAppLayer =
    | 'endpoint' // HTTP endpoints / handlers
    | 'service' // business logic
    | 'db' // database
    | 'integration' // external APIs/SDKs
    | 'file' // file handling
    | 'auth' // authentication
    | 'system' // general system
    | 'infra' // queue, cache, storage
    | 'config' // configuration
    | 'middleware' // request/response middleware (e.g., express/hono middlewares)
    | 'job' // background jobs, workers, schedulers
    | 'cli' // command-line interface/utility scripts
    | 'event' // event buses, event listeners/publishers
    | 'cache'; // cache layers (explicit, if used separately from infra)
