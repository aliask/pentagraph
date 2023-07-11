<script setup>
import { ref, watch } from 'vue'
import * as openpgp from 'openpgp'

const plaintextPlaceholder = '--- Awaiting valid input ---'

const privateKeyArmored = ref('')
const cipherTextarea = ref('')
const plainTextarea = ref(plaintextPlaceholder)
const needsPassphrase = ref(false)
const passphrase = ref('')

const privKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-privkeys')) || [])
const selectedPrivKey = ref('')

async function getPrivateKey(fingerprint) {
  let candidateKeys = privKeys.value.filter((el) => {
    return el.fingerprint == fingerprint
  })
  if (candidateKeys.length == 1) {
    return candidateKeys[0].key
  }
  return null
}

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
  const privateKey = (await getPrivateKey(selectedPrivKey.value)) || privateKeyArmored.value
  console.log(privateKey)
  return decrypt(privateKey, cipherTextarea.value, passphrase.value)
    .then((decrypted) => {
      plainTextarea.value = decrypted.data
    })
    .catch((e) => {
      plainTextarea.value = plaintextPlaceholder
      console.error(e)
    })
}

watch(privateKeyArmored, doDecrypt)
watch(cipherTextarea, doDecrypt)
watch(passphrase, doDecrypt)
watch(selectedPrivKey, doDecrypt)
</script>

<template>
  <div>
    <h1>Decrypt a message</h1>
    <div class="decrypt">
      <div>
        <h3>Private Key</h3>

        <select v-model="selectedPrivKey">
          <option v-for="privKey in privKeys" :value="privKey.fingerprint">
            {{ privKey.name }}
          </option>
          <option value="manual">Enter key manually...</option>
        </select>

        <textarea
          v-model="privateKeyArmored"
          v-if="selectedPrivKey == 'manual'"
          rows="10"
          cols="70"
        ></textarea>
        <div v-if="needsPassphrase">
          <h3>Passphrase</h3>
          <input type="password" v-model="passphrase" />
        </div>
      </div>
      <div>
        <div>
          <h3>Encrypted Message</h3>
          <textarea v-model="cipherTextarea" rows="10" cols="70"></textarea>
        </div>
      </div>
      <div>
        <h3>Decrypted Message</h3>
        <textarea v-model="plainTextarea" rows="23" cols="70" readonly></textarea>
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
