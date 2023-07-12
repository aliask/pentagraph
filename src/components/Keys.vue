<script setup>
import { ref, watch } from 'vue'
import { useKeyStore } from '@/stores/keys'

const keys = useKeyStore()

const showAddPrivateKeys = ref(false)
const newPrivateKey = ref('')
const newPrivateKeyName = ref('')
const newPrivateKeyIsValid = ref(false)

const showAddPublicKeys = ref(false)
const newPublicKey = ref('')
const newPublicKeyName = ref('')
const newPublicKeyIsValid = ref(false)

async function checkPrivateKey(event) {
  let newKey = await keys.checkKey(newPrivateKey.value)
  if(newKey) {
    newPrivateKeyIsValid.value = true
    newPrivateKeyName.value = newKey.name
  } else {
    newPrivateKeyIsValid.value = false
    newPrivateKeyName.value = ''
  }
}
watch(newPrivateKey, checkPrivateKey)

async function checkPublicKey(event) {
  let newKey = await keys.checkKey(newPublicKey.value)
  if(newKey) {
    newPublicKeyIsValid.value = true
    newPublicKeyName.value = newKey.name
  } else {
    newPublicKeyIsValid.value = false
    newPublicKeyName.value = ''
  }
}
watch(newPublicKey, checkPublicKey)

</script>

<template>
  <div class="keys">
    <div>
      <h3>Private Keys</h3>
      <ul class="keyList">
        <li v-for="privKey in keys.privateKeys" :title="'Fingerprint: ' + privKey.fingerprint" :class="{ active: privKey == keys.activePrivateKey}">
          <a href="#" class="key" @click="keys.setPrivateKey(privKey.fingerprint)">{{ privKey.name }}</a>
          -
          <a href="#" @click="keys.deleteKey(privKey.fingerprint)">Delete</a>
        </li>
        <li v-if="!showAddPrivateKeys">
          <button @click="showAddPrivateKeys = true">
            Add a new private key
          </button>
        </li>
      </ul>

      <div v-if="showAddPrivateKeys" class="addKeyAside">
        <textarea
          @keydown.esc="showAddPrivateKeys = false"
          v-model="newPrivateKey"
          class="keyInput"
          :class="{ finished: newPrivateKeyIsValid }"
        ></textarea>
        <span v-if="newPrivateKeyIsValid">Key UserID: {{ newPrivateKeyName }}</span>
        <button @click="showAddPrivateKeys = false">Cancel</button>
        <button @click="keys.addKey(newPrivateKey)" :disabled="!newPrivateKeyIsValid">Add</button>
      </div>
    </div>

    <div>
      <h3>Public Keys</h3>
      <ul class="keyList">
        <li v-for="pubKey in keys.publicKeys" :title="'Fingerprint: ' + pubKey.fingerprint" :class="{ active: pubKey == keys.activePublicKey}">
          <a href="#" class="key" @click="keys.setPublicKey(pubKey.fingerprint)">{{ pubKey.name }}</a>
          -
          <a href="#" @click="keys.deleteKey(pubKey.fingerprint)">Delete</a>
        </li>
        <li v-if="!showAddPublicKeys">
          <button @click="showAddPublicKeys = true">
            Add a new public key
          </button>
        </li>
      </ul>

      <div v-if="showAddPublicKeys" class="addKeyAside">
        <textarea
          @keydown.esc="showAddPublicKeys = false"
          v-model="newPublicKey"
          class="keyInput"
          :class="{ finished: newPublicKeyIsValid }"
        ></textarea>
        <span v-if="newPublicKeyIsValid">Key UserID: {{ newPublicKeyName }}</span>
        <button @click="showAddPublicKeys = false">Cancel</button>
        <button @click="keys.addKey(newPublicKey)" :disabled="!newPublicKeyIsValid">Add</button>
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

a.key::before {
  content: '⚫'
}

.active > a.key::before {
  content: '🟢'
}

button {
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
