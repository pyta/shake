<script setup lang="ts">
import AppSidebar from "@/components/custom/AppSidebar.vue";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-12 items-center gap-2 border-b px-4">
        <SidebarTrigger />
      </header>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
