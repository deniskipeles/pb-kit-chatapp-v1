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
    addMessages,
    chatUsers,
    messages,
    newMessages,
  } from "$lib/store/chat.js";
  import { addSuccessToast } from "$lib/store/toasts.js";
  import { getPbImageUrl } from "$lib/utils/index.js";
  import { Avatar, Button, Card, P } from "flowbite-svelte";
  import { onMount } from "svelte";
  export let data;

  onMount(async () => {
    await updateUnRead();
    scrollToBottom();
    pb.collection("one_to_one_messages").subscribe(
      "*",
      (e) => {
        // console.log(e);
        if (e.action == "create" || e.action == "update") {
          addMessages(e.record);
          // let items = data.resultList.items;
          // CommonHelper.pushOrReplaceByKey(items, e.record, "id");
          // data.resultList.items = items;
          // scrollToBottom();
        }
      },
      {
        expand: "",
        filter: `receiver = '${data?.user?.id}' && sender = '${$page.params?.user_id}'`,
        fields: "*,", //expand.sender.*:excerpt(100),expand.receiver.*:excerpt(100)",
      }
    );
  });

  let message = "";
  async function sendMessage() {
    const dataIN = {
      sender: $currentUser?.id,
      receiver: $page.params.user_id,
      message: message,
    };
    try {
      const record = await pb.collection("one_to_one_messages").create(dataIN);
      addMessages(record);
      // let items = data.resultList.items;
      // CommonHelper.pushOrReplaceByKey(items, record, "id");
      // data.resultList.items = items;
      message = "";
      if (
        $chatUsers.find(
          (i) =>
            i.id == dataIN.receiver ||
            i.receiver == dataIN.receiver ||
            i.sender == dataIN.receiver
        ) == undefined
      ) {
        invalidateAll();
      }
      scrollToBottom();
    } catch (error) {
      console.warn(error);
    }
  }
  // async function encryptMsg(text: string) {
  //   const encoder = new TextEncoder();
  //   const bytes = encoder.encode(text);
  //   const algorithm = {
  //     name: "AES-GCM",
  //     length: 256,
  //   };
  //   const key = await window.crypto.subtle.generateKey(algorithm, true, [
  //     "encrypt",
  //   ]);
  //   const iv = window.crypto.getRandomValues(new Uint8Array(12));
  //   const algorithm2 = {
  //     name: "AES-GCM",
  //     iv,
  //   };
  // }

  function scrollToBottom() {
    var div = document.getElementById("chat-section");
    if (div) {
      div.scrollTop = div?.scrollHeight;
    }
  }
  afterNavigate(async () => {
    await updateUnRead();
    newMessages.update((msg) => {
      msg = msg.filter((i) => i.sender != $page.params?.user_id);
      return msg;
    });
    scrollToBottom();
  });
  beforeNavigate(() => messages.set([]));

  async function updateUnRead() {
    const messages = $newMessages
      .filter((i) => i.sender == $page.params?.user_id)
      ?.map((i) => i.id);

    let promises = [];
    for (const recordId of messages) {
      promises.push(
        pb.collection("one_to_one_messages").update(recordId, { read: true })
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
  <Avatar src={getPbImageUrl(data?.friend, data?.friend?.avatar) ?? ""} />
  <p class="text-lg">
    {data?.friend?.name ?? data?.friend?.username}
  </p>
</div>
<div class="lg:w-4/5 pt-32 bg-gray-100 dark:bg-gray-600">
  <div id="chat-section" class="overflow-y-auto h-96 custom-scrollbar">
    {#each $messages as msg}
      {#if msg.sender == $currentUser?.id}
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
