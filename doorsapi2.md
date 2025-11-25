# DoorsAPI2 - JavaScript/TypeScript API Client

Complete documentation for the DoorsBPM JavaScript/TypeScript API client library.

**Location:** `/cdn/doorsapi2.mjs`
**Swagger API Docs:** http://w3.cloudycrm.net/apidocs
**TypeScript Definitions:** Available in `_types/doorsapi2.mjs` in each repo

## Object Model Hierarchy

```
Session
├── Folders
│   ├── Documents
│   │   ├── Fields
│   │   └── Attachments
│   ├── Views
│   └── SubFolders
├── Forms
│   └── Fields
└── Directory
    └── Accounts
        └── Users
```

## Quick Start

### Browser (Web)

```javascript
// Import from CDN
const doorsapi2 = await import('https://cdn.cloudycrm.net/ghcv/cdn/doorsapi2.mjs');

// Create session
const dSession = new doorsapi2.Session();

// Login with credentials
await dSession.serverSession({
    instance: 'ormay',
    user: 'username',
    password: 'password'
});

// Or use existing authToken
dSession.authToken = 'existing-token-from-cookie';

// Get folder and document
const folder = await dSession.folder(1023); // Folder ID
const doc = await folder.documents(12345); // Document ID

console.log(doc.fields('NOMBRE').value);
```

### Node.js (Server)

```javascript
// Import module
import doorsapi2 from './cdn/doorsapi2.mjs';

// Create session
const dSession = new doorsapi2.Session();

// Set server URL for the instance
dSession.serverUrl = 'https://ormay.cloudycrm.net/restful';

// Server authentication
await dSession.logon('admin', 'secure-password', 'ormay');

// Work with documents
const folder = await dSession.folder(1023);
const doc = await folder.newDoc();

doc.fields('NOMBRE').value = 'Test';
doc.fields('EMAIL').value = 'test@example.com';

await doc.save();
console.log('Document created:', doc.id);

// Close session
await dSession.logoff();
```

## Core Classes

### Session

Main entry point for all API operations.

**Constructor:**
```javascript
const dSession = new doorsapi2.Session(serverUrl, authToken);
```

**Authentication Methods:**

```javascript
// Server-side session (Node.js or server context)
const authToken = await dSession.logon('username', 'password', 'clientname');
// Returns authToken string

// Web session (browser, uses existing authToken from cookies)
await dSession.webSession();

// Check if logged in
const isLogged = await dSession.isLogged; // Returns boolean

// Close session
await dSession.logoff();
```

**Key Properties:**

```javascript
// Session info
dSession.authToken                    // Get/set auth token
dSession.apiKey                       // Get/set API key
await dSession.currentUser            // Current user account object
await dSession.doorsVersion           // Doors version string

// Components
await dSession.directory              // Directory API (accounts, users)
dSession.db                          // Database utilities
dSession.utils                       // Utility functions
dSession.push                        // Push notifications
```

**Main Methods:**

```javascript
// Get folder by ID or path
const folder = await dSession.folder(1023);                    // By ID
const folder = await dSession.folder('/crm/leads');            // By path

// Get form by ID or name
const form = await dSession.form(102);                         // By ID
const form = await dSession.form('Leads');                     // By name

// Import modules dynamically
const module = await dSession.import({
    repo: 'ormay',
    path: 'global.mjs',
    fresh: true  // Cache-busting for development
});

// Execute server-side code
await dSession.execServerCode(code, { doc, folder, ... });

// Close session
await dSession.logoff();
```

### Folder

Represents a document folder in the hierarchy.

**Key Properties:**

```javascript
folder.id                            // Folder ID
folder.name                          // Folder name
folder.type                          // 0=system, 1=document folder, 2=link
folder.description                   // Description
folder.path                          // Full path (e.g., "/crm/leads")
await folder.parent                  // Parent folder object
await folder.form                    // Associated form object
await folder.app                     // Root application folder
```

**Document Operations:**

```javascript
// Get document by ID
const doc = await folder.documents(12345);

// Create new document
const newDoc = await folder.newDoc();
newDoc.fields('NOMBRE').value = 'Test';
await newDoc.save();

// Search documents
const results = await folder.search({
    fields: 'NOMBRE, EMAIL, ESTADO',              // Fields to retrieve
    formula: 'ESTADO = "Activo"',                 // Filter formula
    order: 'FECHACREACION DESC',                  // Sort order
    maxDocs: 100,                                 // Limit results
    maxTextLen: 500                               // Max length for text fields
});

// IMPORTANT: search() returns an array of plain objects
// Field names are uppercase properties
for (let row of results) {
    console.log(row.NOMBRE);    // Access fields as uppercase properties
    console.log(row.EMAIL);
    console.log(row.ESTADO);
}
```

**Subfolder Operations:**

```javascript
// Get subfolder by name
const subfolder = await folder.folders('subfolder-name');

// List all subfolders
const subfolders = await folder.folders();
for (let sub of subfolders.values()) {
    console.log(sub.name);
}
```

**Views:**

```javascript
// Get view by name
const view = await folder.views('My View');

// Execute view
const results = await view.execute();
```

**Properties:**

```javascript
// Get/set folder properties
const value = await folder.properties('propertyName');
await folder.propertiesSet('propertyName', 'value');

// User-specific properties
const userValue = await folder.userProperties('propertyName');
await folder.userPropertiesSet('propertyName', 'value');
```

### Document

Represents a document instance.

**Key Properties:**

```javascript
doc.id                               // Document ID (DOC_ID)
doc.isNew                            // true if not yet saved
doc.subject                          // Document subject/title
doc.created                          // Creation date
doc.modified                         // Last modification date
doc.tags                             // Object for temporary tags/metadata
await doc.parent                     // Parent folder object
await doc.form                       // Associated form object
await doc.owner                      // Owner account object
```

**Field Operations:**

```javascript
// Get field
const field = doc.fields('NOMBRE');

// Read value
const value = field.value;
const oldValue = field.valueOld;     // Previous value

// Set value
field.value = 'New Value';

// Check changes
const hasChanged = field.valueChanged; // true if value changed

// Field properties
field.name                           // Field name
field.type                           // Field type (1=text, 2=int, 3=decimal, 4=date, etc.)
field.isEmpty                        // true if value is null/empty
```

**Save & Delete:**

```javascript
// Save document
await doc.save();

// Save with exit flag (for events)
await doc.save({ exitOnSuccess: true });

// Delete document
await doc.delete();
```

**Attachments:**

```javascript
// Get all attachments
const attachments = doc.attachments();
for (let att of attachments.values()) {
    console.log(att.name, att.size);
}

// Get specific attachment
const att = doc.attachments('filename.pdf');

// Add attachment (browser)
const file = document.getElementById('fileInput').files[0];
const newAtt = await doc.attachmentsAdd(file, 'my-tag');

// Add attachment (Node.js)
const buffer = fs.readFileSync('./file.pdf');
const newAtt = await doc.attachmentsAdd({
    name: 'document.pdf',
    data: buffer,
    type: 'application/pdf'
}, 'invoice');

// Download attachment
const blob = await att.download();      // Returns Blob (browser)
const buffer = await att.download();    // Returns Buffer (Node.js)

// Delete attachment
await att.delete();
```

**ACL (Access Control):**

```javascript
// Grant permissions
await doc.aclGrant(accountId, 'read');
await doc.aclGrant(accountId, 'modify');

// Revoke permissions
await doc.aclRevoke(accountId, 'read');
await doc.aclRevokeAll(accountId);      // Revoke all permissions
```

**Document Log:**

```javascript
// Get document change log
const log = await doc.log();
for (let entry of log) {
    console.log(entry.timestamp, entry.user, entry.changes);
}
```

### Form

Represents a form definition.

**Key Properties:**

```javascript
form.id                              // Form ID (FRM_ID)
form.name                            // Form name
form.description                     // Description
form.guid                            // Unique GUID
```

**Field Definitions:**

```javascript
// Get field definition
const fieldDef = form.fields('NOMBRE');

// Field definition properties
fieldDef.name                        // Field name
fieldDef.type                        // Field type
fieldDef.length                      // Max length (for text fields)
fieldDef.required                    // Is required
```

### Field

Represents a document field instance.

**Properties:**

```javascript
field.name                           // Field name
field.value                          // Current value
field.valueOld                       // Previous value (before changes)
field.valueChanged                   // true if value changed
field.isEmpty                        // true if null/empty
field.type                           // Field type (1=text, 2=int, 3=decimal, 4=date, etc.)
```

**Field Types:**

- `1` - Text (varchar)
- `2` - Integer
- `3` - Decimal/Float
- `4` - Date
- `5` - DateTime
- `6` - Boolean
- `7` - Text (ntext/large text)

### Attachment

Represents a file attachment.

**Properties:**

```javascript
att.id                               // Attachment ID
att.name                             // File name
att.size                             // File size in bytes
att.type                             // MIME type
att.tag                              // Custom tag
att.created                          // Upload date
att.accName                          // Uploader account name
```

**Methods:**

```javascript
// Download file
const data = await att.download();   // Blob (browser) or Buffer (Node.js)

// Delete attachment
await att.delete();

// Update tag
att.tag = 'new-tag';
await att.parent.save();             // Save parent document to persist
```

## Utility Functions

### dSession.utils

Collection of utility functions.

```javascript
await dSession.utils.load();         // Load utils (if not auto-loaded)

// Date utilities
dSession.utils.today()               // Current date (no time)
dSession.utils.now()                 // Current datetime

// Encryption
const encrypted = dSession.utils.encrypt('text', 'password');
const decrypted = dSession.utils.decrypt(encrypted, 'password');

// Error handling
const errMsg = dSession.utils.errMsg(error);  // Extract error message

// Formatting
const formatted = dSession.utils.formatDate(date, 'YYYY-MM-DD');
const formatted = dSession.utils.formatNumber(1234.56, '0,0.00');
```

### dSession.db

Database utilities for SQL operations.

```javascript
// SQL encoding
const encoded = dSession.db.sqlEncode(value, fieldType);

// Field types:
// 1 = text (adds quotes and escapes)
// 2 = integer
// 3 = decimal
// 4 = date
// 5 = datetime

// Example
const formula = `NOMBRE = ${dSession.db.sqlEncode('O\'Brien', 1)}`;
// Result: NOMBRE = 'O''Brien'
```

## Common Patterns

### Creating Documents

```javascript
// Get folder
const folder = await dSession.folder('/crm/leads');

// Create new document
const doc = await folder.newDoc();

// Set fields
doc.fields('NOMBRE').value = 'Acme Corp';
doc.fields('EMAIL').value = 'contact@acme.com';
doc.fields('TELEFONO').value = '+54 9 351 123-4567';
doc.fields('ESTADO').value = 'Nuevo';
doc.fields('EJECUTIVO').value = 'John Doe';
doc.fields('EJECUTIVO_ID').value = 42;

// Set subject
doc.subject = 'Lead: Acme Corp';

// Save
await doc.save();

console.log('Document created with ID:', doc.id);
```

### Updating Documents

```javascript
// Load document
const doc = await folder.documents(12345);

// Modify fields
doc.fields('ESTADO').value = 'En Proceso';
doc.fields('NOTAS').value = 'Contacto realizado el 2025-01-15';

// Check if changed
if (doc.fields('ESTADO').valueChanged) {
    doc.fields('FECHAESTADO').value = new Date();
}

// Save changes
await doc.save();
```

### Searching Documents

```javascript
const folder = await dSession.folder(1023);

// Simple search
const results = await folder.search({
    fields: 'NOMBRE, EMAIL, ESTADO',
    formula: 'ESTADO = "Activo"',
    order: 'NOMBRE ASC'
});

// Iterate results - search() returns plain objects with uppercase field names
for (let row of results) {
    console.log(row.NOMBRE, row.EMAIL, row.ESTADO);
}

// Advanced search with date filter
const results2 = await folder.search({
    fields: 'NOMBRE, EMAIL, EJECUTIVO',
    formula: "FECHACREACION >= '2025-01-01' AND ESTADO <> 'Cerrado'",
    order: 'FECHACREACION DESC',
    maxDocs: 50,
    maxTextLen: 1000
});

// Filter in JavaScript for complex conditions
const filtered = results2.filter(row => row.NOMBRE.includes('Test'));
```

## Important Notes

### Async Operations

All API methods are asynchronous and return Promises. Always use `await`:

```javascript
// ✅ Correct
const folder = await dSession.folder(1023);
const doc = await folder.documents(123);

// ❌ Wrong - will not work
const folder = dSession.folder(1023);  // Returns Promise, not Folder
```

### Field Type Conversion

DoorsAPI2 automatically converts field values based on field type:

```javascript
// Date fields
doc.fields('FECHACREACION').value = new Date();           // JavaScript Date
doc.fields('FECHACREACION').value = '2025-01-15';         // String (auto-converted)

// Numeric fields
doc.fields('CANTIDAD').value = 42;                        // Number
doc.fields('CANTIDAD').value = '42';                      // String (auto-converted)

// Boolean fields
doc.fields('ACTIVO').value = true;                        // Boolean
doc.fields('ACTIVO').value = 1;                           // Number (1=true, 0=false)
```

### Error Handling

```javascript
try {
    const doc = await folder.documents(99999);
    await doc.save();
} catch (error) {
    console.error('Error:', dSession.utils.errMsg(error));
    // Handle specific errors
    if (error.message.includes('not found')) {
        // Document not found
    }
}
```

### Session Management

```javascript
// Check login status
if (await dSession.isLogged) {
    const user = await dSession.currentUser;
    console.log('Logged in as:', user.name);
} else {
    // Redirect to login
}

// Close session
await dSession.logoff();
```

## Advanced Features

### Dynamic Module Loading

```javascript
// Load modules from Git CDN
const module = await dSession.import({
    repo: 'ormay',
    path: 'global.mjs',
    fresh: true  // Development mode - bypass cache
});

await module.setContext({ dSession });
```

### Server-Side Code Execution

```javascript
// Execute code on server
const result = await dSession.execServerCode(`
    const folder = await dSession.folder(1023);
    const doc = await folder.newDoc();
    doc.fields('NOMBRE').value = 'Test';
    await doc.save();
    return doc.id;
`, {
    // Context variables available in code
    customVar: 'value'
});

console.log('Created document ID:', result);
```

### Push Notifications

```javascript
// Send push notification
await dSession.push.send({
    to: accountId,                    // Target account ID
    title: 'New Lead Assigned',
    body: 'You have been assigned a new lead: Acme Corp',
    data: {
        doc_id: doc.id,
        fld_id: folder.id,
        click_action: '/c/form.htm?doc_id=' + doc.id
    }
});
```

## TypeScript Support

TypeScript definitions are available in each repo's `_types/` folder:

```typescript
import doorsapi2 from './cdn/doorsapi2.mjs';

const dSession = new doorsapi2.Session();
dSession.serverUrl = 'https://ormay.cloudycrm.net/restful';
await dSession.logon('admin', 'password', 'ormay');

const folder: doorsapi2.Folder = await dSession.folder(1023);
const doc: doorsapi2.Document = await folder.documents(123);

const nombreField: doorsapi2.Field = doc.fields('NOMBRE');
const value: string = nombreField.value;

await dSession.logoff();
```

## Related Documentation

- **generic6 (Form Controls)**: `/Global/client/generic6.md` - Complete form controls system documentation
- **Database Schema**: `/Desarrollo/CLAUDE.md` - DoorsBPM Database Schema section
- **Swagger API**: http://w3.cloudycrm.net/apidocs
- **Client CLAUDE.md files**: Each client repo has specific examples and patterns
