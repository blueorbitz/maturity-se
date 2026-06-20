import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"
import { decrypt } from "./crypto"
import type { LlmProvider } from "./db/schema"

export type LlmKeyRecord = {
  provider: LlmProvider
  encryptedKey: string
  awsRegion?: string | null
  awsAccessKeyId?: string | null
  encryptedAwsSecretKey?: string | null
}

/**
 * Calls the appropriate LLM with a prompt, returning the text response.
 * Supports OpenAI and AWS Bedrock (Claude on Bedrock).
 */
export async function callLlm(
  keyRecord: LlmKeyRecord,
  prompt: string
): Promise<string> {
  if (keyRecord.provider === "openai") {
    return callOpenAi(keyRecord.encryptedKey, prompt)
  }
  if (keyRecord.provider === "bedrock") {
    return callBedrock(keyRecord, prompt)
  }
  throw new Error(`Unsupported provider: ${keyRecord.provider}`)
}

async function callOpenAi(encryptedKey: string, prompt: string): Promise<string> {
  const apiKey = await decrypt(encryptedKey)

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

async function callBedrock(keyRecord: LlmKeyRecord, prompt: string): Promise<string> {
  const secretKey = await decrypt(keyRecord.encryptedKey)
  const region = keyRecord.awsRegion ?? "us-east-1"
  const accessKeyId = keyRecord.awsAccessKeyId ?? ""

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey: secretKey,
    },
  })

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(body),
  })

  const response = await client.send(command)
  const result = JSON.parse(Buffer.from(response.body).toString())
  return result.content?.[0]?.text ?? ""
}
