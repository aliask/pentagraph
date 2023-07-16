<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="orange">
      <img alt="Logo" class="logo" src="@/assets/pentagraph.png" height="30" />
      Pentagraph
    </h1>
    <h3>
      {{ msg }}
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.1rem;
  font-style: italic;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}
</style>
