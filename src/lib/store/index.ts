import { writable, type Writable } from 'svelte/store';

export const item_on_focus_store: Writable<any> = writable(null);
export const open_record_drawer_store: Writable<any> = writable(false);
