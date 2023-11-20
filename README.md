
# Chat App with SvelteKit and PocketBase

[Chat App Demo](https://chat.ktechs.xyz)

An open-source chat application built with SvelteKit and powered by PocketBase. The app supports end-to-end encryption for one-on-one chats and includes features for group chats.

## Features

- **End-to-End Encryption (E2EE):** Secure one-on-one conversations.
- **Chat Groups:** Collaborate with multiple users in chat groups.
- **Open Source:** Feel free to contribute and customize.

## PocketBase - Open Source Backend

PocketBase is an open-source backend for your next SaaS and mobile app. It provides the following features:

- **Realtime Database:** Keep your data in sync across clients in real time.
- **Authentication:** Secure your app with user authentication.
- **File Storage:** Easily store and retrieve files.
- **Admin Dashboard:** Manage your app with an intuitive admin dashboard.
- **Ready to Use:** Out-of-the-box functionality for quick integration.

## Getting Started

### Installation

```bash
npm install
```

### Usage

```javascript
// JavaScript SDK
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// ... SDK usage examples ...

// Integrate with your favorite frontend stack:
// - Flutter
// - Svelte
// - Vue
// - React
// - Angular
```

## PocketBase SDK Examples

```javascript
// List and search for 'example' collection records
const list = await pb.collection('example').getList(1, 100, {
    filter: 'title != "" && created > "2022-08-01"',
    sort: '-created,title',
});

// Fetch a single 'example' collection record
const record = await pb.collection('example').getOne('RECORD_ID');

// Delete a single 'example' collection record
await pb.collection('example').delete('RECORD_ID');

// Create a new 'example' collection record
const newRecord = await pb.collection('example').create({
    title: 'Lorem ipsum dolor sit amet',
});

// Subscribe to changes in any record from the 'example' collection
pb.collection('example').subscribe('*', function (e) {
    console.log(e.record);
});

// Stop listening for changes in the 'example' collection
pb.collection('example').unsubscribe();
```

## Integration

Integrate PocketBase seamlessly with your favorite frontend stack:

- ![Flutter Logo](path/to/flutter-logo.png)
- ![Svelte Logo](path/to/svelte-logo.png)
- ![Vue Logo](path/to/vue-logo.png)
- ![React Logo](path/to/react-logo.png)
- ![Angular Logo](path/to/angular-logo.png)

© 2023 PocketBase. The Gopher artwork is from [marcusolsson/gophers](https://github.com/marcusolsson/gophers). Crafted by [Your Name].

```
