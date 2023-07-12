<script setup>
import { ref, watch } from 'vue'
import * as openpgp from 'openpgp'
import { useKeyStore } from '@/stores/keys'

const keys = useKeyStore()

const plaintextPlaceholder = '--- Awaiting valid input ---'

const cipherTextarea = ref('')
const plainTextarea = ref(plaintextPlaceholder)
const needsPassphrase = ref(false)
const passphrase = ref('')

async function decrypt(privKey, ciphertext, passphrase) {
  let privateKey = await openpgp.readKey({ armoredKey: privKey })
  if (!privateKey.getKeys()[0].isDecrypted()) {
    needsPassphrase.value = true
    privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readKey({ armoredKey: privKey }),
      passphrase
    })
  }

  return openpgp.decrypt({
    message: await openpgp.readMessage({ armoredMessage: ciphertext }),
    decryptionKeys: privateKey
  })
}

async function doDecrypt() {
  return decrypt(keys.activePrivateKey.key, cipherTextarea.value, passphrase.value)
    .then((decrypted) => {
      plainTextarea.value = decrypted.data
    })
    .catch((e) => {
      plainTextarea.value = plaintextPlaceholder
      console.error(e)
    })
}

watch(cipherTextarea, doDecrypt)
watch(passphrase, doDecrypt)
watch(keys.activePrivateKey, doDecrypt)
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
        <div v-if="needsPassphrase">
          <h3>Passphrase</h3>
          <input v-model="passphrase" type="password">
        </div>
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
