/**
 * Template Generation Test
 * Tests the LLM response parsing and template generation flow
 * Requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.development.local
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"

// Mock LLM response for testing
const mockMinimaxResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          scaleLevels: [
            { level: 1, label: "Initial", description: "Ad-hoc processes" },
            { level: 2, label: "Developing", description: "Repeatable processes" },
            { level: 3, label: "Defined", description: "Documented processes" },
            { level: 4, label: "Managed", description: "Measured and controlled" },
            { level: 5, label: "Optimizing", description: "Continuous improvement" },
          ],
          domains: [
            {
              id: "devops-pipeline",
              name: "CI/CD Pipeline",
              questions: [
                { id: "q1", text: "How automated is your deployment process?", type: "scale" },
                { id: "q2", text: "What is your deployment frequency?", type: "scale" },
                { id: "q3", text: "Describe your rollback strategy", type: "text" },
              ],
            },
            {
              id: "devops-monitoring",
              name: "Monitoring & Observability",
              questions: [
                { id: "q4", text: "How comprehensive is your monitoring?", type: "scale" },
                { id: "q5", text: "Do you have centralized logging?", type: "scale" },
              ],
            },
          ],
        }),
      },
    },
  ],
}

// Test 1: Parse JSON response
function testParseJsonResponse() {
  console.log("Test 1: Parsing JSON response from Minimax...")
  // The actual response from Bedrock contains the JSON as a STRING in content field
  const raw = mockMinimaxResponse.choices[0].message.content as string
  console.log("  Raw response sample:", raw.substring(0, 100) + "...")
  
  // This is what the template generation code does
  const firstBrace = raw.indexOf("{")
  const lastBrace = raw.lastIndexOf("}")
  
  console.log("  First brace at:", firstBrace, "Last brace at:", lastBrace)
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Failed: No JSON object found in response")
  }
  
  const jsonStr = raw.substring(firstBrace, lastBrace + 1)
  console.log("  Extracted JSON:", jsonStr.substring(0, 100) + "...")
  
  try {
    const parsed = JSON.parse(jsonStr)
    console.log("✓ Successfully parsed JSON")
    console.log("  - ScaleLevels:", parsed.scaleLevels.length)
    console.log("  - Domains:", parsed.domains.length)
    console.log("  - First domain questions:", parsed.domains[0].questions.length)
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e}`)
  }
}

// Test 2: Test with actual Bedrock credentials from ENV
async function testBedrockConnection() {
  console.log("\nTest 2: Testing Bedrock connection with ENV credentials...")
  
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  
  if (!accessKeyId || !secretAccessKey) {
    console.warn("⚠ Skipping: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY not set in .env.development.local")
    return
  }
  
  try {
    const client = new BedrockRuntimeClient({
      region: "us-east-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
    
    const body = JSON.stringify({
      messages: [{ role: "user", content: "Reply with only: test-success" }],
      max_tokens: 100,
    })
    
    const command = new InvokeModelCommand({
      modelId: "minimax.minimax-m2.5",
      contentType: "application/json",
      accept: "application/json",
      body: Buffer.from(body),
    })
    
    const response = await client.send(command)
    const result = JSON.parse(Buffer.from(response.body).toString())
    const text = result.choices?.[0]?.message?.content ?? ""
    
    if (text) {
      console.log("✓ Successfully got response from Bedrock")
      console.log("  Response:", text.substring(0, 100))
    } else {
      throw new Error("Empty response from Bedrock")
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("✗ Bedrock test failed:", msg)
    throw error
  }
}

// Test 3: Simulate full template generation flow
async function testFullFlow() {
  console.log("\nTest 3: Simulating full template generation flow...")
  
  // Simulate what comes back from the LLM
  const llmResponse = mockMinimaxResponse.choices[0].message.content
  
  // Extract JSON (same logic as generateTemplate)
  const firstBrace = llmResponse.indexOf("{")
  const lastBrace = llmResponse.lastIndexOf("}")
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("No JSON found")
  }
  
  const jsonStr = llmResponse.substring(firstBrace, lastBrace + 1)
  
  try {
    const parsed = JSON.parse(jsonStr)
    
    // Validate structure
    if (!Array.isArray(parsed.scaleLevels) || !Array.isArray(parsed.domains)) {
      throw new Error("Missing scaleLevels or domains array")
    }
    
    console.log("✓ Full flow successful")
    console.log("  - Title: DevOps Maturity Assessment")
    console.log("  - Scale levels:", parsed.scaleLevels.length)
    console.log("  - Domains:", parsed.domains.length)
    console.log("  - Total questions:", parsed.domains.reduce((sum: number, d: any) => sum + d.questions.length, 0))
  } catch (e) {
    throw new Error(`Flow failed: ${e}`)
  }
}

// Run all tests
async function runAllTests() {
  console.log("=== Template Generation Tests ===\n")
  
  try {
    testParseJsonResponse()
    await testBedrockConnection()
    await testFullFlow()
    
    console.log("\n✓ All tests passed!")
  } catch (error) {
    console.error("\n✗ Test failed:", error)
    process.exit(1)
  }
}

runAllTests()
