<script setup lang="ts">
import { useTodoList } from "./composables/useTodoList.ts";
import { mdiDrag, mdiPlus } from "@mdi/js";
import { ref } from "vue";
import { VList } from "vuetify/components";

const list = ref<VList | null>(null);
const { todoList, addTodo, completeTodo, removeTodo } = useTodoList(list);

const input = ref();

document.addEventListener("keydown", globalHandleKeyDown);

function globalHandleKeyDown(event: KeyboardEvent) {
  // Focus on list
  if (event.ctrlKey && event.key === "t") {
    event.preventDefault();
    if (list.value) list.value.focus("first");
  }
  // Focus on input
  if (event.ctrlKey && event.key === "n") {
    event.preventDefault();
    if (input.value) input.value.focus();
  }
}

function handleInputKeyDown(event: KeyboardEvent) {
  // Focus on list
  if (event.key === "ArrowUp") {
    event.preventDefault();
    list.value?.focus("last");
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    list.value?.focus("first");
  }
}

function handleListItemKeyDown(event: KeyboardEvent, todoIndex: number) {
  // Delete todo
  if (event.key === "Delete") {
    event.preventDefault();
    removeTodo(todoIndex);
    list.value?.focus("first");
  }
}
</script>

<template>
  <v-app id="inspire">
    <v-main>
      <v-list
        ref="list"
        class="pt-0"
        :activatable="false"
        density="compact"
        selectable
        mandatory
        autofocus
      >
        <template v-for="(todo, todoIndex) in todoList" :key="todo">
          <v-list-item
            v-if="!todo.complete"
            tile
            min-height="0"
            height="26"
            class="px-0 py-0"
            @keydown.ctrl.enter="completeTodo(todoIndex)"
            @keydown="handleListItemKeyDown($event, todoIndex)"
          >
            <template #prepend>
              <v-checkbox-btn
                class="text-body-2"
                density="compact"
                tabindex="-1"
                v-model="todo.complete"
              />
            </template>
            <v-list-item-title>{{ todo.body }} </v-list-item-title>
            <template #append>
              <v-icon
                class="cursor-grab"
                :icon="mdiDrag"
                start
                aria-grabbed="true"
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-main>
    <v-bottom-navigation elevation="0" density="comfortable" class="pa-1">
      <v-text-field
        ref="input"
        tabindex="-1"
        color="primary"
        placeholder="New todo"
        variant="outlined"
        density="compact"
        :append-inner-icon="mdiPlus"
        @keydown.enter="addTodo(input)"
        @keydown="handleInputKeyDown"
        hide-details
        class="h-25"
        single-line
      />
    </v-bottom-navigation>
  </v-app>
</template>

<style>
* {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
  -webkit-user-drag: none;
  cursor: default;
}
</style>
