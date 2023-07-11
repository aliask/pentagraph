<script setup>
import { ref, watch } from 'vue'
import * as openpgp from 'openpgp'

const ciphertextPlaceholder = '--- Awaiting valid input ---'
const publicKeyArmored = ref('')
const plaintext = ref('')
const ciphertext = ref(ciphertextPlaceholder)

const pubKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-pubkeys')) || [])
const selectedPubKey = ref('')

async function getPublicKey(fingerprint) {
  let candidateKeys = pubKeys.value.filter((el) => {
    return el.fingerprint == fingerprint
  })
  if (candidateKeys.length == 1) {
    return candidateKeys[0].key
  }
  return null
}

async function encrypt(pubkey, plaintext) {
  const publicKey = await openpgp.readKey({ armoredKey: pubkey })

  return openpgp.encrypt({
    message: await openpgp.createMessage({ text: plaintext }),
    encryptionKeys: publicKey
  })
}

async function doEncrypt() {
  const publicKey = (await getPublicKey(selectedPubKey.value)) || publicKeyArmored.value
  encrypt(publicKey, plaintext.value)
    .then((encrypted) => {
      ciphertext.value = encrypted
    })
    .catch((e) => {
      ciphertext.value = ciphertextPlaceholder
    })
}

watch(publicKeyArmored, doEncrypt)
watch(plaintext, doEncrypt)
</script>

<template>
  <div>
    <h1>Encrypt a message</h1>

    <div class="encrypt">
      <div>
        <h3>Public Key</h3>

        <select v-model="selectedPubKey">
          <option v-for="pubKey in pubKeys" :value="pubKey.fingerprint">{{ pubKey.name }}</option>
          <option value="manual">Enter key manually...</option>
        </select>

        <textarea
          v-model="publicKeyArmored"
          v-if="selectedPubKey == 'manual'"
          rows="10"
          cols="70"
        ></textarea>
      </div>
      <div>
        <h3>Message</h3>
        <textarea v-model="plaintext" rows="10" cols="70"></textarea>
      </div>
      <div>
        <h3>Encrypted Message</h3>
        <textarea v-model="ciphertext" rows="23" cols="70" readonly></textarea>
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
