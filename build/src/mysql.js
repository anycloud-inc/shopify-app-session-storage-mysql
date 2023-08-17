"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLSessionStorage = void 0;
const shopify_api_1 = require("@shopify/shopify-api");
const migrations_1 = require("./migrations");
const mysql_connection_1 = require("./mysql-connection");
const mysql_migrator_1 = require("./mysql-migrator");
const defaultMySQLSessionStorageOptions = {
    connectionPoolLimit: 10,
    sessionTableName: "shopify_sessions",
    migratorOptions: {
        migrationDBIdentifier: "shopify_sessions_migrations",
        migrationNameColumnName: "migration_name",
    },
};
class MySQLSessionStorage {
    static withCredentials(data, opts) {
        const e = encodeURIComponent;
        const url = new URL(`mysql://${e(data.username)}:${e(data.password)}@${data.host}/${e(data.dbName)}`);
        if (data.socketPath != null) {
            url.searchParams.set("socketPath", data.socketPath);
        }
        return new MySQLSessionStorage(url, opts);
    }
    constructor(dbUrl, opts = {}) {
        this.options = { ...defaultMySQLSessionStorageOptions, ...opts };
        this.internalInit = this.init(typeof dbUrl === "string" ? new URL(dbUrl) : dbUrl);
        this.migrator = new mysql_migrator_1.MySqlSessionStorageMigrator(this.connection, this.options.migratorOptions, migrations_1.migrationList);
        this.ready = this.migrator.applyMigrations(this.internalInit);
    }
    async storeSession(session) {
        await this.ready;
        // Note milliseconds to seconds conversion for `expires` property
        const entries = session
            .toPropertyArray()
            .map(([key, value]) => key === "expires"
            ? [key, Math.floor(value / 1000)]
            : [key, value]);
        const query = `
      REPLACE INTO ${this.options.sessionTableName}
      (${entries.map(([key]) => key).join(", ")})
      VALUES (${entries
            .map(() => `${this.connection.getArgumentPlaceholder()}`)
            .join(", ")})
    `;
        await this.connection.query(query, entries.map(([_key, value]) => value));
        return true;
    }
    async loadSession(id) {
        await this.ready;
        const query = `
      SELECT * FROM \`${this.options.sessionTableName}\`
      WHERE id = ${this.connection.getArgumentPlaceholder()};
    `;
        const [rows] = await this.connection.query(query, [id]);
        if (!Array.isArray(rows) || rows?.length !== 1)
            return undefined;
        const rawResult = rows[0];
        return this.databaseRowToSession(rawResult);
    }
    async deleteSession(id) {
        await this.ready;
        const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id = ${this.connection.getArgumentPlaceholder()};
    `;
        await this.connection.query(query, [id]);
        return true;
    }
    async deleteSessions(ids) {
        await this.ready;
        const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id IN (${ids
            .map(() => `${this.connection.getArgumentPlaceholder()}`)
            .join(",")});
    `;
        await this.connection.query(query, ids);
        return true;
    }
    async findSessionsByShop(shop) {
        await this.ready;
        const query = `
      SELECT * FROM ${this.options.sessionTableName}
      WHERE shop = ${this.connection.getArgumentPlaceholder()};
    `;
        const [rows] = await this.connection.query(query, [shop]);
        if (!Array.isArray(rows) || rows?.length === 0)
            return [];
        const results = rows.map((row) => {
            return this.databaseRowToSession(row);
        });
        return results;
    }
    async disconnect() {
        await this.connection.disconnect();
    }
    async init(dbUrl) {
        this.connection = new mysql_connection_1.MySqlConnection(dbUrl, this.options.sessionTableName, this.options.connectionPoolLimit);
        await this.createTable();
    }
    async createTable() {
        const hasSessionTable = await this.connection.hasTable(this.options.sessionTableName);
        if (!hasSessionTable) {
            const query = `
        CREATE TABLE ${this.options.sessionTableName} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline tinyint NOT NULL,
          scope varchar(255),
          expires integer,
          onlineAccessInfo varchar(255),
          accessToken varchar(255)
        )
      `;
            await this.connection.query(query);
        }
    }
    databaseRowToSession(row) {
        // convert seconds to milliseconds prior to creating Session object
        if (row.expires)
            row.expires *= 1000;
        return shopify_api_1.Session.fromPropertyArray(Object.entries(row));
    }
}
exports.MySQLSessionStorage = MySQLSessionStorage;
//# sourceMappingURL=mysql.js.map