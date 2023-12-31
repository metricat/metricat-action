import * as core from '@actions/core'
import * as github from '@actions/github'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

const context = github.context

const METRICS_FILE = 'metrics'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    if (!existsSync(METRICS_FILE)) {
      core.warning(`Metric file not found. Skipping.`)
      return
    }
    const metrics = await readFile(METRICS_FILE)

    const api = core.getInput('api') || 'https://metricat.app/api/v1/metrics'

    await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: core.getInput('token'),
        commit: {
          sha: context.payload.pull_request
            ? context.payload.pull_request?.head.sha
            : context.sha,
          runId: process.env.GITHUB_RUN_ID,
          refName: process.env.GITHUB_REF_NAME,
          headRef: process.env.GITHUB_HEAD_REF,
          baseRef: process.env.GITHUB_BASE_REF
        },
        metricFile: metrics.toString('base64')
      })
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
