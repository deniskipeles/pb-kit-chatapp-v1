import { writable } from "svelte/store";

// logged app admin
export const admin = writable({});

/**
 * @param {null} model
 */
export function setAdmin(model) {
    admin.set(model || {});
}
