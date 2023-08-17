"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlSessionStorageMigrator = void 0;
const shopify_app_session_storage_1 = require("@shopify/shopify-app-session-storage");
class MySqlSessionStorageMigrator extends shopify_app_session_storage_1.RdbmsSessionStorageMigrator {
    constructor(dbConnection, opts = {}, migrations) {
        super(dbConnection, opts, migrations);
    }
    async initMigrationPersistence() {
        const discardCreateTable = await this.connection.hasTable(this.options.migrationDBIdentifier);
        if (!discardCreateTable) {
            const migration = `
      CREATE TABLE ${this.options.migrationDBIdentifier} (
        ${this.getOptions().migrationNameColumnName} varchar(255) NOT NULL PRIMARY KEY
    );`;
            await this.connection.query(migration, []);
        }
    }
    /**
     * This is overriden from the abstract class has the result type is different for mysql
     * @param migrationName - the migration name we want to check in the table
     * @returns true if the 'migrationName' has been found in the migrations table, false otherwise
     */
    async hasMigrationBeenApplied(migrationName) {
        await this.ready;
        const query = `
      SELECT * FROM ${this.options.migrationDBIdentifier}
      WHERE ${this.getOptions().migrationNameColumnName} = 
        ${this.connection.getArgumentPlaceholder(1)};
    `;
        const [rows] = await this.connection.query(query, [migrationName]);
        return Array.isArray(rows) && rows.length === 1;
    }
}
exports.MySqlSessionStorageMigrator = MySqlSessionStorageMigrator;
//# sourceMappingURL=mysql-migrator.js.map