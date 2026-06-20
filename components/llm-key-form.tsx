'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { saveLlmKey, deleteLlmKey } from '@/app/actions/llm-keys'

interface LlmKeyFormProps {
  existing: {
    provider: string
    keyHint: string | null
    awsRegion: string | null
    awsAccessKeyId: string | null
  } | null
}

export function LlmKeyForm({ existing }: LlmKeyFormProps) {
  const [provider, setProvider] = useState<'openai' | 'bedrock'>(
    (existing?.provider as 'openai' | 'bedrock') ?? 'openai'
  )
  const [openaiKey, setOpenaiKey] = useState('')
  const [awsAccessKeyId, setAwsAccessKeyId] = useState(existing?.awsAccessKeyId ?? '')
  const [awsSecretKey, setAwsSecretKey] = useState('')
  const [awsRegion, setAwsRegion] = useState(existing?.awsRegion ?? 'us-east-1')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const result = await saveLlmKey({
      provider,
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

  return (
    <div className="space-y-6">
      {/* Current status */}
      {existing && (
        <Card className="border-primary/20 bg-accent/20">
          <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {existing.provider === 'openai' ? 'OpenAI' : 'AWS Bedrock'} configured
                </p>
                {existing.keyHint && (
                  <p className="text-xs text-muted-foreground font-mono">{existing.keyHint}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-destructive hover:text-destructive">
              {deleting ? 'Removing...' : 'Remove key'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">LLM Provider — BYOK</CardTitle>
          <CardDescription>
            Your API keys are encrypted with AES-256-GCM before storage. They are only used for template generation and are never exposed in responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={provider} onValueChange={(v) => setProvider(v as 'openai' | 'bedrock')}>
            <TabsList className="mb-6">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="bedrock">AWS Bedrock</TabsTrigger>
            </TabsList>

            <TabsContent value="openai" className="space-y-4">
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
                  Used model: <span className="font-mono">gpt-4o-mini</span>. Requires an active OpenAI API key with sufficient credits.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="bedrock" className="space-y-4">
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
                  <Input
                    id="aws-region"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    placeholder="us-east-1"
                  />
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
                  Used model: <span className="font-mono">anthropic.claude-3-haiku-20240307-v1:0</span>. Ensure Bedrock access is enabled in your region.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {message && (
            <div className={`mt-4 text-sm px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end mt-6">
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
