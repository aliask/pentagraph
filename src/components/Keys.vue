<script setup>
import { ref, watch } from 'vue'
import * as openpgp from 'openpgp'
import { useKeyStore } from '@/stores/keys'

const keys = useKeyStore()

const pubKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-pubkeys')) || [])
const privKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-privkeys')) || [])

const showAddPrivateKeys = ref(false)
const newPrivateKey = ref('')
const newPrivateKeyName = ref('')
const newPrivateKeyIsValid = ref(false)

const showAddPublicKeys = ref(false)
const newPublicKey = ref('')
const newPublicKeyName = ref('')
const newPublicKeyIsValid = ref(false)

async function addPrivateKey(event) {
  try {
    let privateKey = await openpgp.readKey({ armoredKey: newPrivateKey.value })
    let newUser = {
      name: (await privateKey.getPrimaryUser()).user.userID.userID,
      fingerprint: privateKey.getFingerprint(),
      key: newPrivateKey.value
    }
    privKeys.value.push(newUser)
    localStorage.setItem('pgp-webui-privkeys', JSON.stringify(privKeys.value))
    newPrivateKey.value = ''
    showAddPrivateKeys.value = false
  } catch (e) {
    console.error(e)
  }
}

async function deletePrivKey(keyFingerprint) {
  privKeys.value = privKeys.value.filter((el) => {
    return el.fingerprint != keyFingerprint
  })
  localStorage.setItem('pgp-webui-privkeys', JSON.stringify(privKeys.value))
}

async function checkPrivateKey(event) {
  try {
    let privateKey = await openpgp.readKey({ armoredKey: newPrivateKey.value })
    newPrivateKeyName.value = (await privateKey.getPrimaryUser()).user.userID.userID
    newPrivateKeyIsValid.value = true
  } catch (e) {
    newPrivateKeyName.value = ''
    newPrivateKeyIsValid.value = false
    console.error(e)
  }
}
watch(newPrivateKey, checkPrivateKey)

async function addPublicKey(event) {
  try {
    let PublicKey = await openpgp.readKey({ armoredKey: newPublicKey.value })
    let newUser = {
      name: (await PublicKey.getPrimaryUser()).user.userID.userID,
      fingerprint: await PublicKey.getFingerprint(),
      key: newPublicKey.value
    }
    pubKeys.value.push(newUser)
    localStorage.setItem('pgp-webui-pubkeys', JSON.stringify(pubKeys.value))
    newPublicKey.value = ''
    showAddPublicKeys.value = false
  } catch (e) {
    console.error(e)
  }
}

async function deletePubKey(keyFingerprint) {
  pubKeys.value = pubKeys.value.filter((el) => {
    return el.fingerprint != keyFingerprint
  })
  localStorage.setItem('pgp-webui-pubkeys', JSON.stringify(pubKeys.value))
}

async function checkPublicKey(event) {
  try {
    let PublicKey = await openpgp.readKey({ armoredKey: newPublicKey.value })
    newPublicKeyName.value = (await PublicKey.getPrimaryUser()).user.userID.userID
    newPublicKeyIsValid.value = true
  } catch (e) {
    newPublicKeyName.value = ''
    newPublicKeyIsValid.value = false
    console.error(e)
  }
}
watch(newPublicKey, checkPublicKey)

async function cancelAdd() {
  showAddPublicKeys.value = false
  showAddPrivateKeys.value = false
}
</script>

<template>
  <div class="keys">
    <div>
      <h3>Private Keys</h3>
      <ul class="keyList">
        <li v-for="privKey in privKeys" :title="'Fingerprint: ' + privKey.fingerprint">
          <a href="#" @click="setPrivateKey(privKey)">{{ privKey.name }}</a>
          -
          <a href="#" @click="deletePrivKey(privKey.fingerprint)">Delete</a>
        </li>
        <li>
          <button @click="showAddPrivateKeys = true" :disabled="showAddPrivateKeys">
            Add a new private key
          </button>
        </li>
      </ul>

      <div v-if="showAddPrivateKeys" class="addKeyAside">
        <h3>Add a new Private Key</h3>
        <textarea
          @keydown.esc="cancelAdd"
          v-model="newPrivateKey"
          class="keyInput"
          :class="{ finished: newPrivateKeyIsValid }"
        ></textarea>
        <span v-if="newPrivateKeyIsValid">Key UserID: {{ newPrivateKeyName }}</span>
        <button @click="addPrivateKey" :disabled="!newPrivateKeyIsValid">Add</button>
      </div>
    </div>

    <div>
      <h3>Public Keys</h3>
      <ul class="keyList">
        <li v-for="pubKey in pubKeys" :title="'Fingerprint: ' + pubKey.fingerprint">
          {{ pubKey.name }} - <a href="#" @click="deletePubKey(pubKey.fingerprint)">Delete</a>
        </li>
        <li>
          <button @click="showAddPublicKeys = true" :disabled="showAddPublicKeys">
            Add a new public key
          </button>
        </li>
      </ul>

      <div v-if="showAddPublicKeys" class="addKeyAside">
        <h3>Add a new Public Key</h3>
        <textarea
          @keydown.esc="cancelAdd"
          v-model="newPublicKey"
          class="keyInput"
          :class="{ finished: newPublicKeyIsValid }"
        ></textarea>
        <span v-if="newPublicKeyIsValid">Key UserID: {{ newPublicKeyName }}</span>
        <button @click="addPublicKey" :disabled="!newPublicKeyIsValid">Add</button>
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .keys {
    display: flex;
    flex-direction: column;
    gap: 2em;
    width: 30vw;
    place-items: center;
  }
}

.keys > * {
  width: 50%;
}

.keyList {
  list-style: none;
  padding: 0.5em;
}

.keyList > * {
  padding: 0.3em;
}

.keyList button {
  display: inline-block;
  outline: none;
  cursor: pointer;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  padding: 2px 16px;
  height: 32px;
  min-width: 60px;
  min-height: 32px;
  border: none;
  color: #fff;
  background-color: #4f545c;
  transition: background-color 0.17s ease, color 0.17s ease;
}

.addKeyAside {
  display: flex;
  flex-direction: column;
  gap: 1em;
  justify-items: start;
}

.keyInput,
.keyInput.finished:focus {
  width: 40em;
  font-family: monospace;
  height: 30em;
}
</style>
