<script lang="ts">
  import { getPbImageUrl } from "$lib/utils";
  import { Li, List, Heading, Avatar } from "flowbite-svelte";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import { chatUsers } from "$lib/store/chat";
  import CommonHelper from "$lib/utils/CommonHelper";
  export let data: PageData;
  $: {
    $chatUsers.forEach((i) => {
      CommonHelper.removeByKey(data.resultList.items ?? [], "id", i?.id);
      CommonHelper.removeByKey(data.resultList.items ?? [], "id", i?.sender);
      CommonHelper.removeByKey(data.resultList.items ?? [], "id", i?.receiver);
    });
  }
</script>

<div class="lg:w-4/5 pt-32 bg-gray-100 dark:bg-gray-600">
  {#each data?.resultList?.items as user}
    <a href={`/one-on-one/${user?.id}`}>
      <div
        class="flex lg:w-4/5 p-2 gap-4 text-center bg-gray-200 dark:bg-gray-700"
      >
        <Avatar src={getPbImageUrl(user, user?.avatar) ?? ""} />
        <div>
          <Heading
            tag="h2"
            customSize="text-lg font-semibold"
            class="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
            >{user?.name ?? user?.username}</Heading
          >
          <List tag="ul" class="space-y-1">
            <Li>{user?.description}</Li>
          </List>
        </div>
      </div>
    </a>
  {/each}
</div>
