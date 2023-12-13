import * as core from '@actions/core'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    if (!existsSync('metricat.json')) {
      console.log('metricat.json not found')
      return
    }
    const metrics = JSON.parse(await readFile('metricat.json', 'utf8'))

    const api = core.getInput('api') ?? 'https://metricat.dev/api/v1/metrics'

    await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: core.getInput('token'),
        sha: process.env.GITHUB_SHA,
        metrics
      })
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
