<template>
  <q-header
    class="bg-secondary text-black"
    style="height: 10vh"
  >
    <q-toolbar>
      <q-toolbar-title>
        <q-img
          class="header-logo"
          src="https://www.upf.edu/o/upf-2016-theme/images/upf/logo.png"
        />
      </q-toolbar-title>
      <q-btn-group>
        <q-btn label="login" />
        <q-btn label="login" />
        <q-btn label="login" />
      </q-btn-group>
    </q-toolbar>
  </q-header>
</template>
<script setup lang="ts"></script>
<style>
.header-logo {
  width: 100px;
}
</style>