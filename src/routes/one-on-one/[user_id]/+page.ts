import { pb } from "$lib/pocketbase";
import { addMessages } from "$lib/store/chat";
import { postData, serializeNonPOJOs } from "$lib/utils";

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, data }) {
  const dt = data ?? {};
  const { user_id } = params;
  let resultList = await pb.collection("one_to_one_messages").getList(1, 50, {
    filter: `sender = "${user_id}" || receiver = "${user_id}"`,
  });
  const friend = await pb.collection("users").getOne(user_id, {
    expand: "",
  });
  await postData(fetch, "one_to_one_messages");
  resultList = serializeNonPOJOs(resultList);
  resultList.items.forEach((m) => {
    addMessages(m);
  });
  return { friend,resultList, ...dt };
}
