"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateScopeFieldToVarchar1024 = exports.migrationList = void 0;
const shopify_app_session_storage_1 = require("@shopify/shopify-app-session-storage");
exports.migrationList = [
    new shopify_app_session_storage_1.MigrationOperation("migrateScopeFieldToVarchar1024", migrateScopeFieldToVarchar1024),
];
// need change the sizr of the scope column from 255 to 1024 char
async function migrateScopeFieldToVarchar1024(connection) {
    await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier} 
      MODIFY COLUMN scope varchar(1024)`);
}
exports.migrateScopeFieldToVarchar1024 = migrateScopeFieldToVarchar1024;
//# sourceMappingURL=migrations.js.map