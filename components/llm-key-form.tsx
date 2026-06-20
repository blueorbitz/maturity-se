'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveLlmKey, deleteLlmKey, testLlmConnection } from '@/app/actions/llm-keys'

const AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
]

interface LlmKeyFormProps {
  existing: {
    provider: string
    keyHint: string | null
    model: string | null
    apiFormat: string | null
    awsRegion: string | null
    awsAccessKeyId: string | null
  } | null
}

export function LlmKeyForm({ existing }: LlmKeyFormProps) {
  // Default to bedrock as requested
  const [provider, setProvider] = useState<'openai' | 'bedrock'>(
    (existing?.provider as 'openai' | 'bedrock') ?? 'bedrock'
  )
  const [openaiKey, setOpenaiKey] = useState('')
  const [openaiModel, setOpenaiModel] = useState(
    existing?.provider === 'openai' ? (existing.model ?? 'gpt-4o-mini') : 'gpt-4o-mini'
  )
  const [awsAccessKeyId, setAwsAccessKeyId] = useState(existing?.awsAccessKeyId ?? '')
  const [awsSecretKey, setAwsSecretKey] = useState('')
  const [awsRegion, setAwsRegion] = useState(existing?.awsRegion ?? 'us-east-1')
  const [bedrockModel, setBedrockModel] = useState(
    existing?.provider === 'bedrock'
      ? (existing.model ?? 'minimax.minimax-m2.5')
      : 'minimax.minimax-m2.5'
  )
  const [bedrockApiFormat, setBedrockApiFormat] = useState<'openai' | 'anthropic'>(
    existing?.provider === 'bedrock'
      ? ((existing.apiFormat as 'openai' | 'anthropic') ?? 'openai')
      : 'openai'
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const result = await saveLlmKey({
      provider,
      model: provider === 'openai' ? openaiModel : bedrockModel,
      apiFormat: provider === 'bedrock' ? bedrockApiFormat : undefined,
      openaiKey: provider === 'openai' ? openaiKey : undefined,
      awsAccessKeyId: provider === 'bedrock' ? awsAccessKeyId : undefined,
      awsSecretKey: provider === 'bedrock' ? awsSecretKey : undefined,
      awsRegion: provider === 'bedrock' ? awsRegion : undefined,
    })
    setSaving(false)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else {
      setMessage({ type: 'success', text: 'API key saved securely.' })
      setOpenaiKey('')
      setAwsSecretKey('')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setMessage(null)
    const result = await deleteLlmKey()
    setDeleting(false)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'API key removed.' })
  }

  async function handleTest() {
    setTesting(true)
    setMessage(null)
    const result = await testLlmConnection()
    setTesting(false)
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    })
  }

  return (
    <div className="space-y-6">
      {/* Current status */}
      {existing && (
        <Card className="border-primary/20 bg-accent/20">
          <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {existing.provider === 'openai' ? 'OpenAI' : 'AWS Bedrock'} configured
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {existing.keyHint && <span>{existing.keyHint}</span>}
                  {existing.model && <span className="ml-2 text-primary/70">{existing.model}</span>}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive shrink-0"
            >
              {deleting ? 'Removing...' : 'Remove key'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">LLM Provider — BYOK</CardTitle>
          <CardDescription>
            Your API keys are encrypted with AES-256-GCM before storage. They are only used for template generation and never exposed in responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={provider} onValueChange={(v) => setProvider(v as 'openai' | 'bedrock')}>
            <TabsList className="mb-6">
              <TabsTrigger value="bedrock">AWS Bedrock</TabsTrigger>
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
            </TabsList>

            {/* ── AWS Bedrock ── */}
            <TabsContent value="bedrock" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bedrock-api-format">API Format</Label>
                <Select value={bedrockApiFormat} onValueChange={(v) => setBedrockApiFormat(v as 'openai' | 'anthropic')}>
                  <SelectTrigger id="bedrock-api-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI format</SelectItem>
                    <SelectItem value="anthropic">Anthropic format</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the API format your model uses (e.g., OpenAI format for Minimax, Anthropic format for Claude).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bedrock-model">Model ID</Label>
                <Input
                  id="bedrock-model"
                  value={bedrockModel}
                  onChange={(e) => setBedrockModel(e.target.value)}
                  placeholder="e.g. minimax.minimax-m2.5"
                  className="font-mono text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the full Bedrock model ID as it appears in the AWS console.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="aws-access-key">AWS Access Key ID</Label>
                  <Input
                    id="aws-access-key"
                    value={awsAccessKeyId}
                    onChange={(e) => setAwsAccessKeyId(e.target.value)}
                    placeholder="AKIA..."
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aws-region">Region</Label>
                  <Select value={awsRegion} onValueChange={setAwsRegion}>
                    <SelectTrigger id="aws-region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AWS_REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aws-secret">AWS Secret Access Key</Label>
                <Input
                  id="aws-secret"
                  type="password"
                  value={awsSecretKey}
                  onChange={(e) => setAwsSecretKey(e.target.value)}
                  placeholder={existing?.provider === 'bedrock' ? '••••••••••••• (update to change)' : 'Secret key'}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Ensure Bedrock model access is enabled in your AWS console for the selected region.
                </p>
              </div>
            </TabsContent>

            {/* ── OpenAI ── */}
            <TabsContent value="openai" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="openai-model">Model ID</Label>
                <Input
                  id="openai-model"
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  placeholder="e.g. gpt-4o-mini"
                  className="font-mono text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Enter any OpenAI model ID, e.g. <span className="font-mono">gpt-4o</span>, <span className="font-mono">gpt-4o-mini</span>, <span className="font-mono">o1-mini</span>.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="openai-key">API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder={existing?.provider === 'openai' ? '••••••••••••• (update to change)' : 'sk-...'}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Requires an active OpenAI API key with sufficient credits.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {message && (
            <div className={`mt-4 text-sm px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            {existing && (
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing}
                className="text-xs"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : existing ? 'Update key' : 'Save key'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security note */}
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <svg className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keys are encrypted with AES-256-GCM using a server-side secret. They are never logged, returned to the client, or shared between users. Keys are used exclusively for AI template generation requests initiated by you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
