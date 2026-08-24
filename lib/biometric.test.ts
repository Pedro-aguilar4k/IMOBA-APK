import { afterEach, describe, expect, it } from 'vitest'
import { isBiometricAvailable } from './biometric'

describe('isBiometricAvailable', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'PublicKeyCredential')
  })

  it('retorna false quando WebAuthn não está disponível', async () => {
    Reflect.deleteProperty(window, 'PublicKeyCredential')
    await expect(isBiometricAvailable()).resolves.toBe(false)
  })

  it('consulta o autenticador da plataforma', async () => {
    Object.defineProperty(window, 'PublicKeyCredential', {
      configurable: true,
      value: {
        isUserVerifyingPlatformAuthenticatorAvailable: async () => true,
      },
    })

    await expect(isBiometricAvailable()).resolves.toBe(true)
  })
})
