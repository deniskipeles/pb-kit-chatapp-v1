import { writable } from "svelte/store";
import CommonHelper from "$lib/utils/CommonHelper";

export const errors = writable({});

/**
 * @param {Object} newErrors
 */
export function setErrors(newErrors: any) {
    errors.set(newErrors || {});
}

/**
 * @param {String}       name
 * @param {String|Array} message
 */
export function addError(name: string, message: string) {
    errors.update((e) => {
        CommonHelper.setByPath(e, name, CommonHelper.sentenize(message))
        return e;
    });
}

/**
 * @param {String} name
 */
export function removeError(name: string) {
    errors.update((e) => {
        CommonHelper.deleteByPath(e, name);
        return e;
    });
}
