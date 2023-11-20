<script lang="ts">
  import "../app.postcss";
  import "$lib/styles/main.scss";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import {
    DarkMode,
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Drawer,
    CloseButton,
    SidebarDropdownWrapper,
    Avatar,
  } from "flowbite-svelte";
  import { Cog } from "svelte-heros-v2";
  import { sineIn } from "svelte/easing";
  import { FooterComp } from "$lib/components";
  import { currentUser, pb } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  import {
    addNewMessages,
    chatGroups,
    chatUsers,
    newMessages,
  } from "$lib/store/chat";
  import { getPbImageUrl } from "$lib/utils";
  import { invalidateAll } from "$app/navigation";

  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
  export let data: PageData;

  let breakPoint: number = 1024;
  let width: number;
  let backdrop: boolean = false;
  let activateClickOutside = true;
  let drawerHidden: boolean = false;
  $: if (width >= breakPoint) {
    drawerHidden = false;
    activateClickOutside = false;
  } else {
    drawerHidden = true;
    activateClickOutside = true;
  }
  onMount(() => {
    pb.collection("one_to_one_messages").subscribe(
      "*",
      (e) => {
        if (e.action == "create") {
          if (
            $chatUsers?.find((user) => user.id == e.record?.sender) == undefined
          ) {
            invalidateAll();
          }
          if (e.record.sender != $page.params?.user_id) {
            addNewMessages(e.record);
          }
        }
      },
      {
        expand: "",
        filter: `receiver = "${data?.user?.id}"`,
        fields: "*,", //expand.sender.*:excerpt(100),expand.receiver.*:excerpt(100)",
      }
    );
    if (width >= breakPoint) {
      drawerHidden = false;
      activateClickOutside = false;
    } else {
      drawerHidden = true;
      activateClickOutside = true;
    }
  });
  const toggleSide = () => {
    if (width < breakPoint) {
      drawerHidden = !drawerHidden;
    }
  };
  const toggleDrawer = () => {
    drawerHidden = false;
  };
  $: activeUrl = $page.url.pathname;

  let spanClass =
    "pl-2 self-center text-md text-gray-900 whitespace-nowrap dark:text-white";
  let divClass = "w-full ml-auto lg:block lg:w-auto order-1 lg:order-none";
  let ulClass =
    "flex flex-col py-3 my-4 lg:flex-row lg:my-0 text-sm font-medium gap-4 dark:lg:bg-transparent lg:bg-white lg:border-0";
  let navDivClass =
    "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 flex items-center justify-between w-full mx-auto py-1.5 px-4";
</script>

<svelte:window bind:innerWidth={width} />
<header class="fixed flex-none w-full mx-auto bg-white dark:bg-slate-950">
  <Navbar let:hidden let:toggle>
    <NavHamburger
      on:click={toggleDrawer}
      btnClass="focus:outline-none whitespace-normal rounded-lg focus:ring-2 p-1.5 focus:ring-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 m-0 mr-3 lg:hidden"
    />
    <NavBrand href="/" class="lg:ml-64">
      <Cog />
      <span
        class="self-center whitespace-nowrap text-xl font-semibold dark:text-white pl-4"
      >
        My Website
      </span>
    </NavBrand>
    <NavUl
      {hidden}
      {divClass}
      {ulClass}
      nonActiveClass="md:!pl-3 md:!py-2 lg:!pl-0 text-gray-700 hover:bg-gray-100 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 dark:text-white lg:dark:hover:text-primary-700 dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent"
      activeClass="md:!pl-3 md:!py-2 lg:!pl-0 lg:text-primary-700 text-white dark:text-white dark:lg:text-primary-500 bg-primary-700 lg:bg-transparent dark:bg-primary-600 lg:dark:bg-transparent cursor-default"
    >
      <NavLi class="lg:px-2 lg:mb-0" active={activeUrl === "/"} href="/"
        >Chats</NavLi
      >
      <NavLi
        class="lg:px-2 lg:mb-0"
        active={activeUrl === "/pages/about"}
        href="/groups">Groups</NavLi
      >
      <NavLi
        class="lg:px-2 lg:mb-0 capitalize"
        href={$currentUser ? `/account` : `/auth/login`}
        on:click={toggle}
        >{$currentUser?.username ?? $currentUser?.email ?? "Login"}</NavLi
      >
    </NavUl>
    <div class="flex items-center ml-auto">
      <DarkMode
        class="inline-block dark:hover:text-white hover:text-gray-900"
      />
    </div>
    <NavHamburger on:click={toggle} btnClass="lg:hidden" />
  </Navbar>
</header>

<Drawer
  transitionType="fly"
  {backdrop}
  {transitionParams}
  bind:hidden={drawerHidden}
  bind:activateClickOutside
  width="w-64"
  class="overflow-scroll pb-32"
  id="sidebar"
>
  <div class="flex items-center">
    <CloseButton
      on:click={() => (drawerHidden = true)}
      class="mb-4 dark:text-white lg:hidden"
    />
  </div>
  <Sidebar asideClass="w-54">
    <SidebarWrapper
      divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800"
    >
      <SidebarGroup>
        {#if $page.url.pathname.startsWith("/groups")}
          {#each $chatGroups as group}
            <SidebarItem
              href={`/groups/${group?.id}`}
              label={group?.name ?? 'No Name'}
              {spanClass}
              activeClass="flex items-center p-2 text-base font-normal text-gray-900 bg-primary-200 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-primary-100 dark:hover:bg-primary-700"
              on:click={toggleSide}
              active={activeUrl === `/groups/${group?.id}`}
            >
              <svelte:fragment slot="icon">
                <Avatar
                  src={getPbImageUrl(
                    group,
                    group?.icon,
                    undefined
                  ) ?? ""}
                />
              </svelte:fragment>
              <svelte:fragment slot="subtext">
                <span
                  class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300"
                  >{group?.members?.length}</span
                >
              </svelte:fragment>
            </SidebarItem>
          {/each}
        {:else}
          {#each $chatUsers as user}
            {@const newMessage = $newMessages.filter(
              (i) => i.sender == user.sender || i.sender == user.receiver
            ).length}
            <SidebarItem
              href={`/one-on-one/${user?.id}`}
              label={user?.user_data?.name ?? user?.user_data?.username}
              {spanClass}
              activeClass="flex items-center p-2 text-base font-normal text-gray-900 bg-primary-200 dark:bg-primary-700 rounded-lg dark:text-white hover:bg-primary-100 dark:hover:bg-primary-700"
              on:click={toggleSide}
              active={activeUrl === `/one-on-one/${user?.id}`}
            >
              <svelte:fragment slot="icon">
                <Avatar
                  src={getPbImageUrl(
                    user?.user_data,
                    user?.user_data?.avatar,
                    undefined
                  ) ?? ""}
                />
              </svelte:fragment>
              <svelte:fragment slot="subtext">
                <span
                  class="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300"
                  >{newMessage}</span
                >
              </svelte:fragment>
            </SidebarItem>
          {/each}
        {/if}
      </SidebarGroup>

      {#if $currentUser}
        <SidebarGroup>
          <SidebarItem
            href={`/account`}
            label={`My Account`}
            {spanClass}
            on:click={toggleSide}
            active={activeUrl === `/account`}
          />
        </SidebarGroup>
        <SidebarGroup>
          <span class={spanClass}>
            <form method="POST" action="/auth/logout">
              <button type="submit">logout<button /></button>
            </form>
          </span>
        </SidebarGroup>
      {:else}
        <SidebarGroup>
          <SidebarItem
            href={`/auth/login`}
            label={`Login`}
            {spanClass}
            on:click={toggleSide}
            active={activeUrl === `/auth/login`}
          />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarItem
            href={`/auth/register`}
            label={`Register`}
            {spanClass}
            on:click={toggleSide}
            active={activeUrl === `/auth/register`}
          />
        </SidebarGroup>
      {/if}
    </SidebarWrapper>
  </Sidebar>
</Drawer>

<div class="flex px-4 mx-auto w-full">
  <main class="lg:pl-64 w-full mx-auto">
    <slot />
  </main>
</div>
<div class="dark:bg-slate-900 mx-auto mb-4 pt-4 lg:pl-64">
  <FooterComp />
</div>
