/// <reference types="node" />
import { Session } from "@shopify/shopify-api";
import { SessionStorage, RdbmsSessionStorageOptions } from "@shopify/shopify-app-session-storage";
export interface MySQLSessionStorageOptions extends RdbmsSessionStorageOptions {
    connectionPoolLimit: number;
}
export declare class MySQLSessionStorage implements SessionStorage {
    static withCredentials(data: {
        host: string;
        dbName: string;
        username: string;
        password: string;
        socketPath?: string;
    }, opts: Partial<MySQLSessionStorageOptions>): MySQLSessionStorage;
    readonly ready: Promise<void>;
    private internalInit;
    private options;
    private connection;
    private migrator;
    constructor(dbUrl: URL | string, opts?: Partial<MySQLSessionStorageOptions>);
    storeSession(session: Session): Promise<boolean>;
    loadSession(id: string): Promise<Session | undefined>;
    deleteSession(id: string): Promise<boolean>;
    deleteSessions(ids: string[]): Promise<boolean>;
    findSessionsByShop(shop: string): Promise<Session[]>;
    disconnect(): Promise<void>;
    private init;
    private createTable;
    private databaseRowToSession;
}
