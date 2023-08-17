/// <reference types="node" />
import { RdbmsConnection } from "@shopify/shopify-app-session-storage";
export declare class MySqlConnection implements RdbmsConnection {
    sessionStorageIdentifier: string;
    private ready;
    private dbUrl;
    private connectionPoolLimit;
    private pool;
    constructor(dbUrl: URL, sessionStorageIdentifier: string, connectionPoolLimit: number);
    query(query: string, params?: any[]): Promise<any[]>;
    /**
     * Runs a series of queries in a transaction.
     *
     * @param queries an array of SQL queries to execute in a transaction
     */
    transaction(queries: string[]): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getDatabase(): string | undefined;
    hasTable(tablename: string): Promise<boolean>;
    getArgumentPlaceholder(_?: number): string;
    private init;
}
