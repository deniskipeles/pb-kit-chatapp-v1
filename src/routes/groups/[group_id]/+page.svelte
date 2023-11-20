<script lang="ts">
  import {
    afterNavigate,
    beforeNavigate,
    invalidateAll,
  } from "$app/navigation";
  import { page } from "$app/stores";
  import AutoExpandTextarea from "$lib/components/AutoExpandTextarea.svelte";
  import Message from "$lib/components/Message.svelte";
  import { currentUser, pb } from "$lib/pocketbase";
  import {
    addGroupMessages,
    chatGroups,
    groupMessages,
    newGroupMessages,
  } from "$lib/store/chat.js";
  import { getPbImageUrl } from "$lib/utils/index.js";
  import { Avatar, Button, Card, P } from "flowbite-svelte";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  export let data:PageData;

  onMount(async () => {
    await updateUnRead();
    scrollToBottom();
    pb.collection("groups_messages").subscribe(
      "*",
      (e) => {
        // console.log(e);
        if (e.action == "create" || e.action == "update") {
          addGroupMessages(e.record);
          scrollToBottom();
        }
      },
      {
        expand: "sender",
        filter: `sender != '${data?.user?.id}' && group = '${$page.params?.group_id}'`,
        fields: "*", //expand.sender.*:excerpt(100),expand.receiver.*:excerpt(100)",
      }
    );
  });

  let message = "";
  async function sendMessage() {
    const members = (data?.group?.members ?? [])?.filter(
      (u: any) => u != data?.user?.id
    );
    const dataIN = {
      sender: data?.user?.id,
      group: $page.params.group_id,
      message: message,
      not_read_by: members,
    };
    try {
      const record = await pb.collection("groups_messages").create(dataIN);
      addGroupMessages(record);
      // let items = data.resultList.items;
      // CommonHelper.pushOrReplaceByKey(items, record, "id");
      // data.resultList.items = items;
      message = "";
      if ($chatGroups.find((i) => i.id == dataIN.group) == undefined) {
        invalidateAll();
      }
      scrollToBottom();
    } catch (error) {
      console.warn(error);
    }
  }

  function scrollToBottom() {
    var div = document.getElementById("chat-section");
    if (div) {
      div.scrollTop = div?.scrollHeight;
    }
  }
  afterNavigate(async () => {
    await updateUnRead();
    newGroupMessages.update((msg) => {
      msg = msg.filter((i) => i.group != $page.params?.group_id);
      return msg;
    });
    scrollToBottom();
  });
  beforeNavigate(() => groupMessages.set([]));

  async function updateUnRead() {
    const messages = $newGroupMessages
      .filter((i) => i.group == $page.params?.group_id)
      ?.map((i) => i.id);
    console.log("read msgs", messages);

    let promises = [];
    for (const recordId of messages) {
      promises.push(
        pb
          .collection("groups_messages")
          .update(recordId, { "not_read_by-": data?.user?.id })
      );
    }

    return Promise.all(promises)
      .then(() => {
        console.log("read msgs");
        // dispatch('updated-read', bulkSelected);
      })
      .catch((err) => {
        console.log(err);
        pb.error(err);
      })
      .finally(() => {
        // updating = false;
        // invalidateAll()
      });
  }
</script>

<div
  class="fixed flex w-full p-2 gap-4 text-center mt-16 bg-gray-200 dark:bg-gray-700"
>
  <Avatar src={getPbImageUrl(data?.group, data?.group?.icon) ?? ""} />
  <p class="text-lg">
    {data?.group?.name ?? data?.group?.username}
  </p>
</div>
<div class="lg:w-4/5 pt-32 bg-gray-100 dark:bg-gray-600">
  <div id="chat-section" class="overflow-y-auto h-96 custom-scrollbar">
    {#each $groupMessages as msg}
      {#if msg.sender == data?.user?.id}
        <div class="mb-1 pl-32 p-2 text-right">
          <div
            class="mb-1 border-2 rounded-lg p-2 shadow-lg inline-block w-auto"
          >
            <Message {msg} />
          </div>
        </div>
      {:else}
        <div class="mb-1 p-2 pr-24">
          <div
            class="mb-1 border-2 rounded-lg p-2 shadow-lg inline-block w-auto bg-blue-700"
          >
            {#if $page.url.pathname.startsWith("/groups")}
              <div class="flex gap-4">
                <Avatar
                  src={getPbImageUrl(
                    msg?.expand?.sender,
                    msg?.expand?.sender?.avatar
                  ) ?? ""}
                />
                <p>
                  {msg?.expand?.sender?.name ?? msg?.expand?.sender?.username}
                </p>
              </div>
            {/if}
            <Message {msg} />
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <div class="flex w-full">
    <div class="w-full">
      <AutoExpandTextarea class="text-lg font-thin p-2" bind:value={message} />
    </div>
    <div class="mb-2">
      <Button on:click={async () => await sendMessage()} class="rounded-full"
        >send</Button
      >
    </div>
  </div>
</div>

<style>
  /* WebKit specific styles for the vertical scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px; /* Customize the width to make it very thin */
    height: 3px; /* Customize the width to make it very thin */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #7b8ca0; /* Customize thumb color */
    border-radius: 50px; /* Set the border radius to 50 for a fully rounded appearance */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #5d656d; /* Customize hover color */
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9; /* Customize track color */
  }

  /* WebKit specific styles for the horizontal scrollbar */
  .custom-scrollbar::-webkit-scrollbar-horizontal {
    width: 1px; /* Customize the height to make it very thin */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:horizontal {
    background-color: #7b8ca0; /* Customize thumb color for horizontal scrollbar */
    border-radius: 50px; /* Set the border radius to 50 for a fully rounded appearance */
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:horizontal:hover {
    background-color: #7b8ca0; /* Customize hover color for horizontal scrollbar */
  }
</style>
