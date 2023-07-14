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
  <div>
    <h1>Encrypt a message</h1>

    <div class="encrypt">
      <div>
        <h3>Message</h3>
        <textarea v-model="plaintext" rows="25" cols="70"></textarea>
      </div>
      <div>
        <h3>Encrypted Message</h3>
        <textarea v-model="ciphertext" rows="25" cols="70" readonly></textarea>
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .encrypt {
    display: flex;
    flex-direction: row;
    gap: 2em;
    width: 70vw;
  }
  .encrypt > * {
    width: 33.33%;
  }
}
</style>
