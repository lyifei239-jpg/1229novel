import CloudBase from '@cloudbase/js-sdk'

let app: ReturnType<typeof CloudBase.init> | null = null

export function getCloudBaseApp() {
  if (app) return app

  const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
  if (!envId) {
    throw new Error('VITE_CLOUDBASE_ENV_ID not configured')
  }

  app = CloudBase.init({
    env: envId
  })

  return app
}

export async function signInAnonymously() {
  const auth = getCloudBaseApp().auth()
  try {
    await auth.signInAnonymously()
  } catch (e) {
    console.warn('Anonymous login failed, using offline mode', e)
  }
}

export function getDatabase() {
  return getCloudBaseApp().database()
}
