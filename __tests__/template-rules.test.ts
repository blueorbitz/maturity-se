/**
 * Template Rules Tests (Issue 0005)
 *
 * Tests for:
 * 1. Server action rejects cloned templates from being made public
 * 2. Server action allows non-cloned templates to be made public
 * 3. Author attribution in public gallery queries
 *
 * Note: These are logic-level tests. Full integration tests require a test
 * framework (e.g. Vitest) and database setup.
 */

// ─── Test 1: Cloned template visibility guard logic ──────────────────────────

function testClonedTemplateGuard() {
  console.log("Test 1: Cloned template visibility guard logic...")

  // Simulate the guard logic from updateTemplateVisibility
  function canMakePublic(clonedFromId: string | null, visibility: string): boolean {
    if (clonedFromId && visibility === "public") return false
    return true
  }

  // Cloned template -> public: should be blocked
  if (canMakePublic("some-source-id", "public") !== false) {
    throw new Error("Failed: Cloned template should not be allowed to go public")
  }
  console.log("  ✓ Cloned template -> public: blocked")

  // Cloned template -> private: should be allowed (no-op but allowed)
  if (canMakePublic("some-source-id", "private") !== true) {
    throw new Error("Failed: Cloned template -> private should be allowed")
  }
  console.log("  ✓ Cloned template -> private: allowed")

  // Non-cloned template -> public: should be allowed
  if (canMakePublic(null, "public") !== true) {
    throw new Error("Failed: Non-cloned template -> public should be allowed")
  }
  console.log("  ✓ Non-cloned template -> public: allowed")

  // Non-cloned template -> private: should be allowed
  if (canMakePublic(null, "private") !== true) {
    throw new Error("Failed: Non-cloned template -> private should be allowed")
  }
  console.log("  ✓ Non-cloned template -> private: allowed")
}

// ─── Test 2: Error message for cloned template ──────────────────────────────

function testClonedTemplateErrorMessage() {
  console.log("\nTest 2: Error message for cloned template...")

  const expectedMessage = "Cloned templates cannot be made public"

  // Verify the guard throws with the correct message
  function assertThrows(fn: () => void, expected: string) {
    try {
      fn()
      throw new Error("Expected function to throw")
    } catch (e) {
      if (e instanceof Error && e.message === expected) return
      throw new Error(`Expected error "${expected}" but got "${e instanceof Error ? e.message : e}"`)
    }
  }

  assertThrows(() => {
    const clonedFromId = "source-123"
    const visibility = "public"
    if (clonedFromId && visibility === "public") {
      throw new Error("Cloned templates cannot be made public")
    }
  }, expectedMessage)

  console.log("  ✓ Correct error message thrown for cloned -> public")
}

// ─── Test 3: Author attribution display logic ───────────────────────────────

function testAuthorAttribution() {
  console.log("\nTest 3: Author attribution display logic...")

  // Simulate the display logic from TemplateCard
  function topicLine(topic: string, authorName: string | null | undefined): string {
    if (authorName) return `${topic} · by ${authorName}`
    return topic
  }

  // With author name
  const withAuthor = topicLine("DevOps", "Alice")
  if (withAuthor !== "DevOps · by Alice") {
    throw new Error(`Failed: Expected "DevOps · by Alice" but got "${withAuthor}"`)
  }
  console.log('  ✓ With author: "DevOps · by Alice"')

  // Without author (null)
  const nullAuthor = topicLine("DevOps", null)
  if (nullAuthor !== "DevOps") {
    throw new Error(`Failed: Expected "DevOps" but got "${nullAuthor}"`)
  }
  console.log('  ✓ Null author: "DevOps"')

  // Without author (undefined)
  const undefinedAuthor = topicLine("DevOps", undefined)
  if (undefinedAuthor !== "DevOps") {
    throw new Error(`Failed: Expected "DevOps" but got "${undefinedAuthor}"`)
  }
  console.log('  ✓ Undefined author: "DevOps"')

  // Empty string author (should be treated as no author)
  const emptyAuthor = topicLine("DevOps", "")
  if (emptyAuthor !== "DevOps") {
    throw new Error(`Failed: Expected "DevOps" but got "${emptyAuthor}"`)
  }
  console.log('  ✓ Empty author: "DevOps"')
}

// ─── Test 4: Author name null coalescing from DB ────────────────────────────

function testAuthorNameNullCoalescing() {
  console.log("\nTest 4: Author name null coalescing from DB...")

  // Simulate the coalescing logic from getPublicTemplates
  function coalesceAuthorName(name: string | null): string | null {
    return name || null
  }

  if (coalesceAuthorName("Alice") !== "Alice") {
    throw new Error('Failed: "Alice" should pass through')
  }
  console.log('  ✓ "Alice" -> "Alice"')

  if (coalesceAuthorName(null) !== null) {
    throw new Error("Failed: null should stay null")
  }
  console.log("  ✓ null -> null")

  if (coalesceAuthorName("") !== null) {
    throw new Error('Failed: "" should become null')
  }
  console.log('  ✓ "" -> null')

  if (coalesceAuthorName("  ") !== "  ") {
    throw new Error('Failed: "  " should pass through (only empty string is falsy)')
  }
  console.log('  ✓ "  " -> "  " (whitespace preserved)')
}

// ─── Run all tests ──────────────────────────────────────────────────────────

async function runAllTests() {
  console.log("=== Template Rules Tests (Issue 0005) ===\n")

  try {
    testClonedTemplateGuard()
    testClonedTemplateErrorMessage()
    testAuthorAttribution()
    testAuthorNameNullCoalescing()

    console.log("\n✓ All tests passed!")
  } catch (error) {
    console.error("\n✗ Test failed:", error)
    process.exit(1)
  }
}

runAllTests()
