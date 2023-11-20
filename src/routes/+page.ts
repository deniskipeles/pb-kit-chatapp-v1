import { pb } from "$lib/pocketbase";
import { chatUsers } from "$lib/store/chat";
import { get } from "svelte/store";

/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
  const users = ((get(chatUsers))?.map(u=>`(id != "${u?.sender}" && id != "${u?.receiver}")`))?.join(' && ')
  console.log(users)
  const dt = data ?? {};
  let resultList = await pb.collection("users").getList(1, 50, {
    filter: `${users}`,
    fields: `*:excerpt(100)`
  });
  return { resultList, ...dt };
}