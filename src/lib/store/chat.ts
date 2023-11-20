import { writable, type Writable } from "svelte/store";
import CommonHelper from "$lib/utils/CommonHelper";
import type { RecordModel } from "pocketbase";

export const chatUsers: Writable<RecordModel[]> = writable([]);
export const chatGroups: Writable<RecordModel[]> = writable([]);
export const newMessages: Writable<RecordModel[]> = writable([]);
export const messages: Writable<RecordModel[]> = writable([]);
export const groupMessages: Writable<RecordModel[]> = writable([]);
export const newGroupMessages: Writable<RecordModel[]> = writable([]);

export function addChatGroups(group: RecordModel) {
  chatGroups.update((t) => {
    CommonHelper.pushOrReplaceByKey(t, group, "id");

    return t;
  });
}

export function addMessages(message: RecordModel) {
  messages.update((t) => {
    CommonHelper.pushOrReplaceByKey(t, message, "id");

    return t;
  });
}
export function addNewMessages(message: RecordModel) {
  newMessages.update((t) => {
    CommonHelper.pushOrReplaceByKey(t, message, "id");

    return t;
  });
}

export function addGroupMessages(message: RecordModel) {
  groupMessages.update((t) => {
    CommonHelper.pushOrReplaceByKey(t, message, "id");

    return t;
  });
}
export function addNewGroupMessages(message: RecordModel) {
  newGroupMessages.update((t) => {
    CommonHelper.pushOrReplaceByKey(t, message, "id");

    return t;
  });
}

export function addChatUsers(
  user: RecordModel,
  me: RecordModel,
  action: "create" | "update" | "delete"
) {
  if (user?.sender == me?.id) {
    user.id = user?.receiver;
    user.user_data = user.expand?.receiver ?? {};
  } else {
    user.id = user?.sender;
    user.user_data = user.expand?.sender ?? {};
  }
  chatUsers.update((t) => {
    removeObjectFromArray(t, user);

    CommonHelper.pushOrReplaceByKey(t, user, "id");

    return t;
  });
}

export function removeUser(idOrUser: string | RecordModel) {
  chatUsers.update((t) => {
    removeObjectFromArray(t, idOrUser);

    return t;
  });
}

export function removeAllUsers() {
  chatUsers.update((t) => {
    for (let user of t) {
      removeObjectFromArray(t, user);
    }

    return [];
  });
}

// Internal toast removal method (usually used to delete previous duplicated toasts).
// NB! This doesn't update the store value! Use `removeToast()` instead.
function removeObjectFromArray(arr: any[], idOrObject: any, key = "id") {
  let object: any;
  if (typeof idOrObject == "string") {
    object = CommonHelper.findByKey(arr, key, idOrObject);
  } else {
    object = idOrObject;
  }

  if (!object) {
    return;
  }

  CommonHelper.removeByKey(arr, "id", object.id);
}
