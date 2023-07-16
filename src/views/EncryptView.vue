<script setup>
import { ref, watch } from 'vue'
import { useKeyStore } from '@/stores/keys'
import { storeToRefs } from 'pinia'

const keys = useKeyStore()
const { activePublicKey } = storeToRefs(keys)

const plaintext = ref('')
const ciphertext = ref('')

async function doEncrypt() {
  return keys.encrypt(plaintext.value)
    .then((encrypted) => {
      ciphertext.value = encrypted
    })
    .catch((e) => {
      ciphertext.value = e
    })
}

watch(plaintext, doEncrypt)
watch(activePublicKey, doEncrypt)
</script>

<template>
  <h2>Encrypt a message</h2>

  <div class="encrypt">
    <div>
      <h3>Message</h3>
      <textarea v-model="plaintext"></textarea>
    </div>
    <div>
      <h3>Encrypted Message</h3>
      <textarea v-model="ciphertext" @click="$event.target.select()" readonly></textarea>
    </div>
  </div>
</template>

<style>
h3 {
  margin-bottom: 0.5em;
}

@media (min-width: 1024px) {
  .encrypt {
    display: flex;
    flex-direction: row;
    gap: 2em;
  }
  .encrypt > * {
    width: 50%;
  }
}
</style>
