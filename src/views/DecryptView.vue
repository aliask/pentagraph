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
  <div>
    <h1>Decrypt a message</h1>
    <div class="decrypt">
      <div>
        <div>
          <h3>Encrypted Message</h3>
          <textarea v-model="cipherTextarea" rows="25" cols="70"></textarea>
        </div>
      </div>
      <div>
        <h3>Decrypted Message</h3>
        <textarea v-model="plainTextarea" rows="25" cols="70" readonly></textarea>
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .decrypt {
    display: flex;
    flex-direction: row;
    gap: 2em;
    width: 70vw;
  }
  .decrypt > * {
    width: 33.33%;
  }
}
</style>
