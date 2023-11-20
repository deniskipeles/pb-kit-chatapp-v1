import { pb } from "$lib/pocketbase";
import { serializeNonPOJOs } from "$lib/utils";


export async function load({ data }) {
  let resultList = await pb.collection("view_all_groups").getList(1, 50, {
    filter: `members ?!~ "${data?.user?.id}" `,
    fields: `*:excerpt(100)`
  });
  resultList = serializeNonPOJOs(resultList);
  return { ...data,resultList };
}
