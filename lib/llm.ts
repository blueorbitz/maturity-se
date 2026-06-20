import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"
import { decrypt } from "./crypto"
import type { LlmProvider } from "./db/schema"

export type LlmKeyRecord = {
  provider: LlmProvider
  encryptedKey: string
  model?: string | null
  apiFormat?: "openai" | "anthropic"
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
    const model = keyRecord.model?.trim() || "gpt-4o-mini"
    return callOpenAi(keyRecord.encryptedKey, prompt, model)
  }
  if (keyRecord.provider === "bedrock") {
    return callBedrock(keyRecord, prompt)
  }
  throw new Error(`Unsupported provider: ${keyRecord.provider}`)
}

async function callOpenAi(encryptedKey: string, prompt: string, model: string): Promise<string> {
  const apiKey = await decrypt(encryptedKey)

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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

  const modelId = keyRecord.model?.trim() || "minimax.minimax-m2.5"
  const apiFormat = keyRecord.apiFormat ?? "anthropic"
  
  // Build request based on API format
  let requestBody: string
  if (apiFormat === "openai") {
    // OpenAI format (used by models like Minimax)
    requestBody = JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    })
  } else {
    // Anthropic format (used by Claude, etc.)
    requestBody = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })
  }

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(requestBody),
  })

  try {
    const response = await client.send(command)
    const result = JSON.parse(Buffer.from(response.body).toString())
    
    // Check for Bedrock error in response
    if (result.error) {
      throw new Error(`Bedrock API error: ${result.error}`)
    }
    
    // Extract text based on API format
    let text = ""
    if (apiFormat === "openai") {
      // OpenAI format: { "choices": [{ "message": { "content": "..." } }] }
      text = result.choices?.[0]?.message?.content ?? ""
    } else {
      // Anthropic format: { "content": [{ "type": "text", "text": "..." }] }
      text = result.content?.[0]?.text ?? ""
    }
    
    if (!text) {
      throw new Error(`Bedrock (${modelId}) returned an empty response. Check: 1) AWS credentials validity, 2) Model is enabled in your region, 3) Model ID format is correct for the provider.`)
    }
    
    return text
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    
    // Provide specific guidance based on error type
    if (errorMsg.includes("InvalidSignatureException") || errorMsg.includes("UnrecognizedClientException") || errorMsg.includes("signature")) {
      throw new Error("AWS credentials are invalid or expired. Check your Access Key ID and Secret Access Key in Settings.")
    }
    if (errorMsg.includes("AccessDenied") || errorMsg.includes("not authorized")) {
      throw new Error(`Not authorized to use model ${modelId}. Check: 1) Bedrock is enabled for this model in your AWS region, 2) Your IAM user has bedrock:InvokeModel permission.`)
    }
    if (errorMsg.includes("ResourceNotFoundException") || errorMsg.includes("UnrecognizedModelException")) {
      throw new Error(`Model ${modelId} not found or not available in region ${region}. Verify the model ID is correct for your region.`)
    }
    
    throw error
  }
}
