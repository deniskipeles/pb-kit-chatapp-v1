<script>
  import {
    Card,
    Button,
    Label,
    Input,
    Checkbox,
    Breadcrumb,
    BreadcrumbItem,
    Spinner,
    Radio,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  /** @type {import('./$types').PageData} */
  export let data;
  onMount(() => {
    if ($page.data?.user) {
      goto("/account", { replaceState: true });
    }
  });
  /** @type {import('./$types').ActionData} */
  export let form;
  let loading = false;

  import { applyAction, enhance } from "$app/forms";
  import { pb } from "$lib/pocketbase";
  import { ErrorComp } from "$lib/components";
  import { page } from "$app/stores";
  let group = data.authTables[0];
</script>

<svelte:head>
  <title>Login Form</title>
  <meta
    name="description"
    content="This is where our users login to access our online services"
  />
</svelte:head>

<Breadcrumb class="pt-16 py-8">
  <BreadcrumbItem href="/" home>Home</BreadcrumbItem>
  <BreadcrumbItem>Login</BreadcrumbItem>
</Breadcrumb>

{#if form?.error}
  <ErrorComp error={form?.error} />
{/if}

<div class="text-center">
  <Card>
    <form
      class="flex flex-col space-y-6"
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ result }) => {
          pb.authStore.loadFromCookie(document.cookie);
          await applyAction(result);
          loading = false;
        };
      }}
    >
      <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">
        Sign in to our platform
      </h3>
      {#if data?.authTables?.length > 1}
        <div class="grid grid-cols-2 gap-6">
          {#each data?.authTables as item}
            <div class="form-field">
              <input
                name="user_type"
                type="radio"
                id="radio-{item}"
                bind:group
                value={item}
              />
              <label for="radio-{item}">{item}</label>
            </div>
            <!-- <div class="rounded border border-gray-200 dark:border-gray-700">
				<Radio name="user_type" group={group} value={item} class="w-full p-4">{item}</Radio>
			</div> -->
          {/each}
        </div>
      {:else if data?.authTables?.length == 1}
        <input
          type="hidden"
          value={data?.authTables[0]}
          name="user_type"
        />
      {/if}
      <Label class="space-y-2">
        <span>Email / Username</span>
        <Input type="text" name="email" placeholder="user123" required />
      </Label>
      <Label class="space-y-2">
        <span>Your password</span>
        <Input type="password" name="password" placeholder="•••••" required />
      </Label>

      <div class="flex items-start">
        <Checkbox>Remember me</Checkbox>
        <a
          href="/"
          class="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500"
          >Lost password?</a
        >
      </div>
      {#if loading}
        <Button id="b2" class="-mb-2">
          <Spinner />loading...
        </Button>
      {:else}
        <Button type="submit" class="w-full">Login to your account</Button>
      {/if}
      <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
        Not registered? <a
          href="/register"
          class="text-blue-700 hover:underline dark:text-blue-500"
          >Create account</a
        >
      </div>
    </form>
  </Card>
</div>
