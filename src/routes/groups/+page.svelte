<script lang="ts">
  import {
    Avatar,
    Button,
    Heading,
    Input,
    Label,
    Li,
    List,
  } from "flowbite-svelte";
  import type { PageData } from "./$types";
  import type { RecordModel } from "pocketbase";
  import { currentUser, pb } from "$lib/pocketbase";
  import { goto, invalidateAll } from "$app/navigation";
  import { getPbImageUrl, setObjectFormData } from "$lib/utils";

  export let data: PageData;

  async function joinGroup(group: RecordModel) {
    const dataIN = {
      "members+": data?.user?.id,
      //   admins: ["RELATION_RECORD_ID"],
    };
    try {
      const record = await pb.collection("groups").update(group.id, dataIN);
      invalidateAll();
      goto(`/groups/${record?.id}`);
    } catch (error) {
      console.log(error);
    }
  }

  import { Drawer, CloseButton } from "flowbite-svelte";
  import { sineIn } from "svelte/easing";
  import EditorField from "$lib/components/EditorField.svelte";
  let hidden1 = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  const field = {
    name: "Description",
    type: "editor",
  };
  const inputData = {
    name: "",
    description: "",
    public: false,
    members: [data?.user?.id],
    admins: [data?.user?.id],
  };

  let icon: File;
  async function handleFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      icon = Array.from(inputElement.files)[0];
    }
  }

  async function createGroup() {
    const formData = setObjectFormData(inputData);
    formData.append("icon", icon);
    try {
      const record = await pb.collection("groups").create(formData);
      if (record?.id) {
        hidden1 = true;
        goto(`/groups/${record?.id}`);
        invalidateAll();
      }
    } catch (error) {
      console.warn(error);
    } finally {
    }
  }
</script>

<div
  class="fixed flex w-full p-2 gap-4 text-center mt-16 bg-gray-200 dark:bg-gray-700"
>
  <Button on:click={() => (hidden1 = false)}>Create Group</Button>
</div>
<div class="lg:w-4/5 pt-32 bg-gray-100 dark:bg-gray-600">
  {#each data?.resultList?.items as group}
    <a href={`/groups/${group?.id}`}>
      <div
        class="flex lg:w-4/5 p-2 gap-4 text-center bg-gray-200 dark:bg-gray-700"
      >
        <Avatar src={getPbImageUrl(group, group?.icon) ?? ""} />
        <div>
          <Heading
            tag="h2"
            customSize="text-lg font-semibold"
            class="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
            >{group?.name ?? group?.username ?? "no name"}</Heading
          >
          <List tag="ul" class="space-y-1">
            <Li>{group?.description}</Li>
          </List>
          <Button on:click={async () => await joinGroup(group)}>Join</Button>
        </div>
      </div>
    </a>
  {/each}
</div>

<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={hidden1}
  id="sidebar1"
  activateClickOutside={false}
>
  <div class="flex items-center">
    <h5
      id="drawer-label"
      class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
    >
      <svg
        class="w-5 h-5 mr-2"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        /></svg
      >Create Your Group
    </h5>
    <CloseButton
      on:click={() => (hidden1 = true)}
      class="mb-4 dark:text-white"
    />
  </div>
  <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
    A form for creating a group.
  </p>
  <form>
    <div class="grid gap-6 mb-6 md:grid-cols-1">
      <div>
        <Label for="group_name" class="mb-2">Group name</Label>
        <Input
          class="w-full"
          type="text"
          id="group_name"
          placeholder="Svelte Group"
          bind:value={inputData.name}
          required
        />
      </div>
      <div>
        <Label for="group_icon" class="mb-2">Group icon</Label>
        <input
          class="w-full"
          type="file"
          id="group_icon"
          placeholder="Svelte Group Icon"
          bind:this={icon}
          on:change={handleFileChange}
        />
      </div>
      <Label for="radio-group" class="">Group Type</Label>
      <div class="form-field">
        <input
          name="pulic"
          type="checkbox"
          id="radio-group"
          value={inputData?.public}
          bind:checked={inputData.public}
        />
        <label for="radio-group"
          >{inputData?.public
            ? "Is Public | Anyone can join."
            : "Is Private | Members will have to be added."}</label
        >
      </div>
      <EditorField bind:value={inputData.description} {field} />
    </div>
  </form>
  <div class="grid grid-cols-2 gap-4">
    <Button color="light" on:click={() => (hidden1 = true)}>Cancel</Button>
    <Button on:click={async () => await createGroup()}
      >Create <svg
        class="w-4 h-4 ml-1"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
          clip-rule="evenodd"
        /></svg
      ></Button
    >
  </div>
  {JSON.stringify(inputData)}
</Drawer>
