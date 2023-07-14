<script setup>
import { ref, watch } from 'vue'
import * as openpgp from 'openpgp'
import { useKeyStore } from '@/stores/keys'
import { storeToRefs } from 'pinia'

const keys = useKeyStore()
const { activePublicKey } = storeToRefs(keys)

const ciphertextPlaceholder = '--- Awaiting valid input ---'
const plaintext = ref('')
const ciphertext = ref(ciphertextPlaceholder)

async function encrypt(pubkey, plaintext) {
  const publicKey = await openpgp.readKey({ armoredKey: pubkey })

  return openpgp.encrypt({
    message: await openpgp.createMessage({ text: plaintext }),
    encryptionKeys: publicKey
  })
}

async function doEncrypt() {
  encrypt(activePublicKey.value.key, plaintext.value)
    .then((encrypted) => {
      ciphertext.value = encrypted
    })
    .catch((e) => {
      ciphertext.value = ciphertextPlaceholder
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
