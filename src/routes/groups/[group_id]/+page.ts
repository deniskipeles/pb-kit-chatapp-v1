import { pb } from "$lib/pocketbase";
import { addGroupMessages, addNewGroupMessages } from "$lib/store/chat";
import { postData, serializeNonPOJOs } from "$lib/utils";
import type { RecordModel } from "pocketbase";

export async function load({ params, fetch, data }) {
  const dt = data ?? {};
  const { group_id } = params;
  let resultList = await pb.collection("groups_messages").getList(1, 50, {
    filter: `group = "${group_id}"`,
    expand: `sender`,
    sort: "-created",
  });
  let newArr: RecordModel[] = [];
  resultList?.items?.forEach((i) => {
    newArr = [i, ...newArr];
  });
  resultList.items = newArr;
  const group = await pb.collection("groups").getOne(group_id, {
    expand: "admins,members",
  });
  await postData(fetch, "groups_messages");
  //   console.log(data);
  if (data) {
    await getUnreadMessages(data?.user?.id, group_id);
  }

  resultList = serializeNonPOJOs(resultList);
  resultList.items.forEach((m) => {
    addGroupMessages(m);
  });
  return { group, resultList, ...dt };
}

async function getUnreadMessages(user_id = "", group_id = "") {
  try {
    const unreadMessages = await pb.collection("groups_messages").getFullList({
      filter: `not_read_by ~ "${user_id}" && group = "${group_id}" && sender != "${user_id}"`,
      fields: "id,sender",
    });
    console.log(unreadMessages);
    unreadMessages?.forEach((element) => {
      addNewGroupMessages(element);
    });
  } catch (error) {
    console.log("unable to recover new messages");
  }
}
