<script lang="ts">
  import { getPbImageUrl } from "$lib/utils";
  import { Avatar } from "flowbite-svelte";
  import type { RecordModel } from "pocketbase";

  export let msg: RecordModel;
</script>

<div class="w-1/3">
  <pre>
    {msg?.message ?? ""}
  </pre>
  {#if msg?.files?.length > 0}
     <div class="flex gap-2">
       {#each msg?.files ?? [] as file}
         <Avatar rounded src={getPbImageUrl(msg, file) ?? ""} />
       {/each}
     </div>
  {/if}
</div>
