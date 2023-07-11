import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as openpgp from 'openpgp'

export const useKeyStore = defineStore('keys', () => {
  const privateKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-privkeys')) || [])
  const selectedPrivateKey = ref('')

  const publicKeys = ref(JSON.parse(localStorage.getItem('pgp-webui-pubkeys')) || [])
  const selectedPublicKey = ref('')

  const activePublicKey = computed(
    () =>
      publicKeys.value.filter((e) => {
        e.fingerprint == selectedPublicKey.value
      })[0]
  )
  const activePrivateKey = computed(
    () =>
      privateKeys.value.filter((e) => {
        e.fingerprint == selectedPrivateKey.value
      })[0]
  )

  async function setPrivateKey(fingerprint) {
    selectedPrivateKey.value = fingerprint
  }
  async function setPublicKey(fingerprint) {
    selectedPublicKey.value = fingerprint
  }

  async function addKey(armoredKey) {
    let key = await openpgp.readKey({ armoredKey })
    let newKey = {
      name: (await key.getPrimaryUser()).user.userID.userID,
      fingerprint: key.getFingerprint(),
      key: armoredKey
    }
    if (key.isPrivate()) {
      privateKeys.value.push(newKey)
      localStorage.setItem('pgp-webui-privkeys', JSON.stringify(privateKeys.value))
    } else {
      publicKeys.value.push(newKey)
      localStorage.setItem('pgp-webui-pubkeys', JSON.stringify(publicKeys.value))
    }
  }

  async function checkKey(armoredKey) {
    try {
      let key = await openpgp.readKey({ armoredKey })
    } catch (e) {
      console.error(e)
      return null
    }
    let newKey = {
      name: (await key.getPrimaryUser()).user.userID.userID,
      fingerprint: key.getFingerprint(),
      key: armoredKey
    }
    return newKey
  }

  async function deleteKey(fingerprint) {
    publicKeys.value = publicKeys.value.filter((e) => {
      e.fingerprint != fingerprint
    })
    localStorage.setItem('pgp-webui-pubkeys', JSON.stringify(publicKeys.value))
    privateKeys.value = privateKeys.value.filter((e) => {
      e.fingerprint != fingerprint
    })
    localStorage.setItem('pgp-webui-privkeys', JSON.stringify(privateKeys.value))
  }

  return {
    privateKeys,
    publicKeys,
    activePublicKey,
    activePrivateKey,
    setPrivateKey,
    setPublicKey,
    addKey,
    checkKey,
    deleteKey
  }
})
