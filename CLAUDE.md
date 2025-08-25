# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Content Delivery Network (CDN) repository for a web-based CRM system called "Cloudy CRM7". The codebase supports both web and mobile app environments through a dual-platform architecture:

- **Web Platform**: Uses Bootstrap 5.3 for UI components
- **App Platform**: Uses Framework7 7.0 for mobile app development
- **Backend**: Classic ASP with .NET integration through Doors API

### Key Components

**Core System Files:**
- `doorsapi.js` / `doorsapi2.mjs`: Main API layer for backend communication
- `jslib.js`: Core utility library with date/time, validation, and helper functions
- `include.js`: Dynamic script loader with version management and dependency resolution
- `app7/index.js`: Main application entry point for Framework7-based mobile app

**Application Modules:**
- `app7/`: Mobile application components (Framework7-based)
  - `global.js`: Global app utilities and event handlers
  - `controls.js`: UI control implementations
  - `explorer.js`: File/document browser functionality
  - `sync.js`: Data synchronization with server
  - `session.mjs`: Session management
- `web/`: Web application components (Bootstrap-based)
- `conversation/`: Chat/messaging system integration
- `wapp/`: WhatsApp connector module

**Theming System:**
- Multiple theme support through `app7/cloudy/` and `app7/sade/` directories
- Dynamic theme loading based on package name or URL parameters

## Development Commands

This repository uses a CDN approach without traditional build tools. Scripts are served dynamically with version control:

```bash
# No build commands - files are served directly
# Version management is handled through include.js system
```

**Script Management:**
- Scripts are registered in `include.js` with version numbers
- Use `include('script-id')` to load dependencies
- Version control through localStorage override: `localStorage.setItem('scripts', JSON.stringify([{id: 'script-name', version: 0}]))`

## DoorsAPI2 Architecture

The `doorsapi2.mjs` file is the core ES6 module providing the main API interface. It follows an object-oriented design pattern with the following class hierarchy:

### Core Classes

**Session** (`export class Session`):
- Main entry point for all API operations
- Handles authentication, token management, and session lifecycle
- Provides access to all other API components

**DoorsMap** (`export class DoorsMap extends Map`):
- Case-insensitive Map implementation
- Used throughout the API for collections
- Provides additional helper methods like `find()`, `exists()`, `item()`

**SimpleBuffer** (`export class SimpleBuffer extends Uint8Array`):
- Simplified Buffer implementation for browser compatibility
- Handles file operations and binary data

### Data Management Classes

**Document** (`export class Document`):
- Represents CRM documents/records
- Handles field operations, attachments, and form interactions
- Supports CRUD operations and validation

**Folder** (`export class Folder`):
- File system abstraction for document organization
- Supports hierarchical folder structures
- Provides search and navigation capabilities

**Field** (`export class Field`):
- Individual data field management
- Type-specific validation and formatting
- Integration with form controls

**Attachment** (`export class Attachment`):
- File attachment handling
- S3 integration for cloud storage
- Support for various file types

### Directory and User Management

**Directory** (`export class Directory`):
- User and account directory services
- Search and authentication capabilities

**Account** (`export class Account`):
- Base class for all account types
- Hierarchical account relationships
- Property and permission management

**User** (`export class User extends Account`):
- User-specific functionality
- Authentication and session management
- User preferences and settings

### Forms and Views

**Form** (`export class Form`):
- Dynamic form generation and management
- Field layout and validation
- Integration with document workflow

**View** (`export class View`):
- Data presentation and filtering
- Custom queries and result formatting

### Utility Classes

**Database** (`export class Database`):
- Database operations and query execution
- Transaction management
- SQL execution and result processing

**Utilities** (`export class Utilities`):
- Helper functions and common operations
- Date/time formatting, encoding, validation
- Cross-platform compatibility utilities

**Properties** (`export class Properties extends DoorsMap`):
- Key-value property management
- Type-safe property access
- Persistence and synchronization

**Node** (`export class Node`):
- Server-side code execution
- VBScript integration
- Remote procedure calls

**Push** (`export class Push`):
- Push notification management
- Device registration and messaging

## Development Patterns

**Session Initialization:**
```javascript
// Initialize session
const dSession = new doorsapi2.Session();
await dSession.webSession(); // For web applications
// or
dSession.serverUrl = 'https://api.example.com/restful';
dSession.authToken = 'your-auth-token';
```

**Document Operations:**
```javascript
// Load document
const doc = await dSession.document(12345);
const field = doc.field('FIELD_NAME');
await field.value('New Value');
await doc.save();
```

**Folder Navigation:**
```javascript
// Navigate folders
const rootFolder = await dSession.folder(1001);
const subFolder = await rootFolder.folder('SubFolder');
const documents = await subFolder.documents();
```

**Script Loading:**
```javascript
// Load single script
await include('jslib');

// Load multiple scripts with dependencies
await include([
    { id: 'jquery', src: 'https://code.jquery.com/jquery-3.6.0.min.js' },
    { id: 'doorsapi', depends: ['jquery'] }
]);
```

**Platform Detection:**
```javascript
var inApp = typeof app7 == 'object'; // true for mobile app, false for web
```

**Database Operations:**
```javascript
// SQLite (app) / Server database operations through unified API
dbRead('SELECT * FROM table WHERE condition', [], successCallback, errorCallback);
```

## Architecture Patterns

**Dual Platform Support:**
- Code checks `typeof app7 == 'object'` to determine if running in mobile app vs web
- UI components adapt automatically: Bootstrap for web, Framework7 for app
- Shared business logic in `jslib.js` and API layers

**Dynamic Module Loading:**
- Scripts are loaded on-demand using the `include()` system
- Version management allows rollback and branch testing
- GitHub CDN integration for development (`gitcdn.asp`)

**Custom Component System:**
- `controls.js` provides unified UI components that work across both platforms
- Tab system works with both Bootstrap tabs and Framework7 tabs
- Form validation and data handling abstractions

**API Architecture:**
- `doorsapi2.mjs` provides modern ES6 module interface with Promise-based API
- `doorsapi.js` maintains backward compatibility
- Session management with automatic token refresh
- Unified error handling through `errMsg()` utility

**Dependency Management:**
The system automatically loads required utilities:
- **moment.js**: Date/time handling with timezone support
- **numeral.js**: Number formatting with locale support
- **CryptoJS**: Encryption and security functions
- **fast-xml-parser**: XML processing
- **serialize-error**: Error handling and serialization

## Key Utilities

**Date/Time Handling:**
- `ISODate()`, `ISOTime()`: Standardized date formatting
- `cDate()`: Robust date parsing with fallbacks
- Moment.js integration with Spanish locale default
- Server timezone: 'America/Argentina/Cordoba'

**Data Validation:**
- `validEmail()`: Email validation
- `numbersOnly()`: Extract numeric characters
- `htmlEncode()`, `sqlEncode()`: Security encoding

**UI Helpers:**
- `tabClick()`: Universal tab switching for both platforms
- `highlightControl()`: Focus and highlight form controls
- `toast()`: Cross-platform notifications

**Caching:**
- `getCache()`, `setCache()`: Simple in-memory caching system
- Script-level caching through localStorage overrides

## Custom Themes

Theme customization through subdirectories:
- Theme detection via `BuildInfo.packageName` or URL parameters
- CSS and JS overrides in theme-specific folders
- Dynamic loading: `include('app7-' + custom + '-index')`

## WhatsApp Integration

Specialized WhatsApp connector in `/wapp/`:
- Message handling and template system
- Integration with CRM conversation system
- Support for both web and app platforms

## Error Handling

The system provides comprehensive error handling:
- `serialize-error` for error serialization across boundaries
- `errMsg()` utility for user-friendly error messages
- Promise-based error propagation
- Custom error types for different scenarios

## Security Considerations

- Token-based authentication with automatic refresh
- Secure cookie handling for web sessions
- Encrypted password storage and transmission
- SQL injection prevention through parameterized queries
- XSS protection through proper encoding