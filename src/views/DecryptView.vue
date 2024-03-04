<script setup>
import { ref, watch } from 'vue'
import { useKeyStore } from '@/stores/keys'
import { storeToRefs } from 'pinia'

const keys = useKeyStore()
const { activePrivateKey, privateKeyLocked } = storeToRefs(keys)

const cipherTextarea = ref('')
const plainTextarea = ref('')

async function doDecrypt() {
  return keys.decrypt(cipherTextarea.value)
    .then((decrypted) => {
      plainTextarea.value = decrypted.data
    })
    .catch((e) => {
      plainTextarea.value = e
    })
}

watch(cipherTextarea, doDecrypt)
watch(activePrivateKey, doDecrypt)
watch(privateKeyLocked, doDecrypt)
</script>

<template>
  <h2>Decrypt a message</h2>
  <div class="decrypt">
    <div>
      <div>
        <h3>Encrypted Message</h3>
        <textarea v-model="cipherTextarea"></textarea>
      </div>
    </div>
    <div>
      <h3>Decrypted Message</h3>
      <textarea v-model="plainTextarea" readonly></textarea>
    </div>
  </div>
</template>

<style>
h3 {
  margin-bottom: 0.5em;
}

@media (min-width: 1024px) {
  .decrypt {
    display: flex;
    flex-direction: row;
    gap: 2em;
  }
  .decrypt > * {
    width: 50%;
  }
}
</style>
