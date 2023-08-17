"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlConnection = void 0;
const promise_1 = require("mysql2/promise");
class MySqlConnection {
    constructor(dbUrl, sessionStorageIdentifier, connectionPoolLimit) {
        this.dbUrl = dbUrl;
        this.connectionPoolLimit = connectionPoolLimit;
        this.ready = this.init();
        this.sessionStorageIdentifier = sessionStorageIdentifier;
    }
    async query(query, params = []) {
        await this.ready;
        return this.pool.query(query, params);
    }
    /**
     * Runs a series of queries in a transaction.
     *
     * @param queries an array of SQL queries to execute in a transaction
     */
    async transaction(queries) {
        await this.ready;
        // check if the first and last queries are BEGIN and COMMIT, if they are, ignore them
        // mysql2
        if (queries[0] === "BEGIN") {
            queries.shift();
        }
        if (queries[queries.length - 1] === "COMMIT") {
            queries.pop();
        }
        const client = await this.pool.getConnection();
        try {
            await client.beginTransaction();
            for (const query of queries) {
                await client.query(query);
            }
            await client.commit();
        }
        catch (error) {
            // rollback if any of the queries fail
            await client.rollback();
            throw error;
        }
        finally {
            client.release();
        }
    }
    async connect() {
        await this.ready;
        // Nothing else to do here
        return Promise.resolve();
    }
    async disconnect() {
        await this.ready;
        await this.pool.end();
        this.ready = this.init();
    }
    getDatabase() {
        return decodeURIComponent(this.dbUrl.pathname.slice(1));
    }
    async hasTable(tablename) {
        await this.ready;
        const query = `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = ${this.getArgumentPlaceholder()}
          AND TABLE_SCHEMA = ${this.getArgumentPlaceholder()};
    `;
        // Allow multiple apps to be on the same host with separate DB and querying the right
        // DB for the session table existence
        const [rows] = await this.pool.query(query, [
            tablename,
            this.getDatabase(),
        ]);
        return Array.isArray(rows) && rows.length === 1;
    }
    getArgumentPlaceholder(_) {
        return `?`;
    }
    async init() {
        this.pool = (0, promise_1.createPool)({
            connectionLimit: this.connectionPoolLimit,
            host: this.dbUrl.hostname,
            user: decodeURIComponent(this.dbUrl.username),
            password: decodeURIComponent(this.dbUrl.password),
            database: this.getDatabase(),
            port: Number(this.dbUrl.port),
            socketPath: this.dbUrl.searchParams.get("socketPath") ?? undefined,
        });
    }
}
exports.MySqlConnection = MySqlConnection;
//# sourceMappingURL=mysql-connection.js.map