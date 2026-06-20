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

  console.log("[v0] Bedrock call - Region:", region, "AccessKeyId hint:", accessKeyId.substring(0, 4) + "...")

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

  const modelId = keyRecord.model?.trim() || "minimax.minimax-m2.5"
  console.log("[v0] Bedrock modelId:", modelId)

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(body),
  })

  try {
    const response = await client.send(command)
    console.log("[v0] Bedrock response status:", response.$metadata?.httpStatusCode)
    
    const result = JSON.parse(Buffer.from(response.body).toString())
    console.log("[v0] Bedrock parsed response:", JSON.stringify(result).substring(0, 300))
    
    // Check for Bedrock error in response
    if (result.error) {
      console.error("[v0] Bedrock error response:", result.error)
      throw new Error(`Bedrock API error: ${result.error}`)
    }
    
    // Extract text from Claude response structure
    // Claude returns { "content": [{ "type": "text", "text": "..." }] }
    let text = ""
    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      const firstContent = result.content[0]
      text = firstContent.text ?? ""
    }
    
    if (!text) {
      console.error("[v0] Bedrock returned empty text. Full response:", JSON.stringify(result))
      throw new Error("Bedrock returned an empty response. Verify: 1) AWS Access Key ID and Secret Key are correct, 2) Bedrock is enabled for the model in your region, 3) The model ID is valid.")
    }
    
    return text
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Bedrock call failed:", errorMsg)
    
    // Re-throw with more context about what might be wrong
    if (errorMsg.includes("InvalidSignatureException") || errorMsg.includes("UnrecognizedClientException")) {
      throw new Error("AWS credentials are invalid or expired. Check your Access Key ID and Secret Access Key in Settings.")
    }
    if (errorMsg.includes("AccessDenied") || errorMsg.includes("ValidationException")) {
      throw new Error("Cannot access this Bedrock model. Check that Bedrock is enabled for this model in your AWS region, and your IAM user has permission to invoke models.")
    }
    
    throw error
  }
}
