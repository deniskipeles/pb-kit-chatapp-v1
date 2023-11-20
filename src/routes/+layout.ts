import { currentUser, pb } from "$lib/pocketbase";
import { addChatGroups, addChatUsers, addNewMessages } from "$lib/store/chat";
import { postData, serializeNonPOJOs } from "$lib/utils";
import type { RecordModel } from "pocketbase";

/** @type {import('./$types').LayoutLoad} */
export const load = async ({ fetch, data }) => {
  // console.log((data))
  // const rest = await parent();
  let chatUsers: RecordModel[] = [];
  let chatUsersError: any;
  let chatGroups: RecordModel[] = [];
  let chatGroupsError: any;

  try {
    chatUsers = await pb.collection("view_chat_users").getFullList({
      sort: "-created",
      expand: "sender,receiver",
    });
    await postData(fetch, "users");
    chatUsers = serializeNonPOJOs(chatUsers);
    chatUsers?.forEach((element) => {
      addChatUsers(element, data.user, "create");
    });
  } catch (error) {
    chatUsersError = serializeNonPOJOs(error);
  }
  try {
    chatGroups = await pb.collection("view_groups").getFullList({
      sort: "-created",
    });
    await postData(fetch, "groups");
    chatGroups = serializeNonPOJOs(chatGroups);
    chatGroups?.forEach((element) => {
      addChatGroups(element);
    });
  } catch (error) {
    chatGroupsError = serializeNonPOJOs(error);
  }
  try {
    let unreadMessages = await pb
      .collection("one_to_one_messages")
      .getFullList({
        filter: `receiver = "${data?.user?.id}" && read=${false}`,
      });
    unreadMessages = serializeNonPOJOs(unreadMessages);
    unreadMessages?.forEach((element) => {
      addNewMessages(element);
    });
  } catch (error) {
    console.log('unable to recover new messages')
  }

  return {
    ...data,
    chatUsers,
    chatGroups,
    chatGroupsError,
    chatUsersError,
  };
};
