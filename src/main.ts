import * as core from '@actions/core'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

const METRICS_FILE = "metrics.json"

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    if (!existsSync(METRICS_FILE)) {
      console.log(`${METRICS_FILE} not found`)
      return
    }
    const metrics = JSON.parse(await readFile(METRICS_FILE, 'utf8'))

    const api = core.getInput('api') ?? 'https://metricat.dev/api/v1/metrics'

    await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: core.getInput('token'),
        commit: {
          sha: process.env.GITHUB_SHA,
          runId: process.env.GITHUB_RUN_ID,
          refName: process.env.GITHUB_REF_NAME,
          headRef: process.env.GITHUB_HEAD_REF,
          baseRef: process.env.GITHUB_BASE_REF
        },
        metrics
      })
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
