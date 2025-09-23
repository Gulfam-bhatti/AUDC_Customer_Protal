'use client'

import { useState, useEffect } from 'react'
import { Session, User, Provider } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Types for redirect configuration
interface RedirectConfig {
  url: string
  isConfigured: boolean
  domain: string
  subdomain: string
  environment: 'development' | 'staging' | 'production' | 'unknown'
}

interface DomainMapping {
  [key: string]: {
    environment: 'development' | 'staging' | 'production'
    callbackPath?: string
    postAuthRedirect?: string
  }
}

export default function OAuthDebug(): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectConfig, setRedirectConfig] = useState<RedirectConfig>({
    url: '',
    isConfigured: false,
    domain: '',
    subdomain: '',
    environment: 'unknown'
  })

  // Domain mapping configuration
  const domainMapping: DomainMapping = {
    'localhost': {
      environment: 'development',
      callbackPath: '/auth/callback',
      postAuthRedirect: '/auth/oauth'
    },
    'audc.prob.solutions': {
      environment: 'production',
      callbackPath: '/auth/callback',
      postAuthRedirect: '/dashboard'
    },
    'staging.audc.prob.solutions': {
      environment: 'staging',
      callbackPath: '/auth/callback',
      postAuthRedirect: '/dashboard'
    },
    'app.audc.prob.solutions': {
      environment: 'production',
      callbackPath: '/auth/callback',
      postAuthRedirect: '/app'
    },
    'admin.audc.prob.solutions': {
      environment: 'production',
      callbackPath: '/auth/callback',
      postAuthRedirect: '/admin'
    }
  }

  useEffect(() => {
    configureRedirectUrl()
    initializeAuth()
  }, [])

  const configureRedirectUrl = (): void => {
    if (typeof window === 'undefined') return

    const hostname = window.location.hostname
    const origin = window.location.origin
    const subdomain = hostname.split('.')[0]
    
    // Find matching domain configuration
    let environment: 'development' | 'staging' | 'production' | 'unknown' = 'unknown'
    let callbackPath = '/auth/callback'
    
    // Check for exact domain match
    const exactMatch = domainMapping[hostname]
    if (exactMatch) {
      environment = exactMatch.environment
      callbackPath = exactMatch.callbackPath || '/auth/callback'
    } else {
      // Check for partial matches
      if (hostname.includes('localhost')) {
        environment = 'development'
      } else if (hostname.includes('staging')) {
        environment = 'staging'
      } else if (hostname.includes('audc.prob.solutions')) {
        environment = 'production'
      }
    }

    const redirectUrl = `${origin}${callbackPath}`
    
    setRedirectConfig({
      url: redirectUrl,
      isConfigured: true,
      domain: hostname,
      subdomain: subdomain,
      environment: environment
    })

    console.log('🔗 OAuth redirect configured:', {
      hostname,
      origin,
      redirectUrl,
      subdomain,
      environment
    })
  }

  const initializeAuth = async (): Promise<void> => {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session retrieval error:', error)
        setError(error.message)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setError(null)
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error('Auth initialization error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const signInWithProvider = async (provider: Provider): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      if (!redirectConfig.isConfigured) {
        throw new Error('Redirect URL not configured. Please wait for configuration to complete.')
      }

      console.log(`🚀 Attempting ${provider} OAuth...`)
      console.log('📍 Using redirect URL:', redirectConfig.url)
      console.log('🏠 Domain info:', redirectConfig)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectConfig.url,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('❌ OAuth Error Details:', error)
        throw error
      }

      console.log('✅ OAuth Response:', data)
    } catch (err) {
      console.error('❌ OAuth Error:', err)
      setError(err instanceof Error ? err.message : 'OAuth failed with unknown error')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      console.log('👋 User signed out')
    } catch (err) {
      console.error('❌ Sign out error:', err)
      setError(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const testAuthEndpoint = async (): Promise<void> => {
    try {
      console.log('🔍 Testing auth endpoint...')
      const response = await fetch('https://supa.audc.prob.solutions/auth/v1/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('📊 Response status:', response.status)
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Auth Settings:', data)
      alert('✅ Auth endpoint is working! Check console for details.')
    } catch (err) {
      console.error('❌ Endpoint test failed:', err)
      alert(`❌ Auth endpoint failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const getEnvironmentBadgeColor = (env: string): string => {
    switch (env) {
      case 'development': return '#ff9800'
      case 'staging': return '#2196f3'
      case 'production': return '#4caf50'
      default: return '#757575'
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔐 OAuth Debug Screen (TypeScript)</h1>
      
      {/* Environment Badge */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '5px 10px', 
        backgroundColor: getEnvironmentBadgeColor(redirectConfig.environment),
        color: 'white',
        borderRadius: '15px',
        display: 'inline-block',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {redirectConfig.environment.toUpperCase()}
      </div>

      {/* Connection Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>🔗 Connection Status</h3>
        <p><strong>Supabase URL:</strong> https://supa.audc.prob.solutions</p>
        <p><strong>User:</strong> {user ? '✅ Authenticated' : '❌ Not authenticated'}</p>
        <p><strong>Session:</strong> {session ? '✅ Active' : '❌ No session'}</p>
        <p><strong>Domain:</strong> {redirectConfig.domain || 'Not detected'}</p>
        <p><strong>Subdomain:</strong> {redirectConfig.subdomain || 'None'}</p>
        <p><strong>Redirect URL:</strong> <code>{redirectConfig.url || 'Not configured'}</code></p>
        <p><strong>Configured:</strong> {redirectConfig.isConfigured ? '✅ Yes' : '❌ No'}</p>
        
        <button 
          onClick={testAuthEndpoint} 
          style={{ 
            marginTop: '10px', 
            padding: '8px 12px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Auth Endpoint
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '5px',
          border: '1px solid #ffcdd2'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Auth Buttons */}
      {!user ? (
        <div style={{ marginBottom: '20px' }}>
          <h3>🔐 Sign In With:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => signInWithProvider('google')}
              disabled={loading || !redirectConfig.isConfigured}
              style={{ 
                padding: '12px 20px', 
                backgroundColor: loading ? '#ccc' : '#4285f4', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: !redirectConfig.isConfigured ? 0.5 : 1
              }}
            >
              {loading ? '⏳ Loading...' : '🟢 Google'}
            </button>
            <button 
              onClick={() => signInWithProvider('github')}
              disabled={loading || !redirectConfig.isConfigured}
              style={{ 
                padding: '12px 20px', 
                backgroundColor: loading ? '#ccc' : '#333', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: !redirectConfig.isConfigured ? 0.5 : 1
              }}
            >
              {loading ? '⏳ Loading...' : '⚫ GitHub'}
            </button>
            <button 
              onClick={() => signInWithProvider('discord')}
              disabled={loading || !redirectConfig.isConfigured}
              style={{ 
                padding: '12px 20px', 
                backgroundColor: loading ? '#ccc' : '#5865F2', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: !redirectConfig.isConfigured ? 0.5 : 1
              }}
            >
              {loading ? '⏳ Loading...' : '🟣 Discord'}
            </button>
          </div>
          {!redirectConfig.isConfigured && (
            <p style={{ color: '#ff9800', fontSize: '12px', marginTop: '5px' }}>
              ⚠️ Waiting for redirect URL configuration...
            </p>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={signOut}
            disabled={loading}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: loading ? '#ccc' : '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Signing out...' : '🚪 Sign Out'}
          </button>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
          <h3>👤 User Information</h3>
          <div style={{ marginBottom: '10px' }}>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Provider:</strong> {user.app_metadata?.provider}</p>
            <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Full User Data</summary>
            <pre style={{ fontSize: '11px', overflow: 'auto', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '3px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Session Info */}
      {session && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <h3>🎫 Session Information</h3>
          <p><strong>Access Token:</strong> {session.access_token ? '✅ Present' : '❌ Missing'}</p>
          <p><strong>Refresh Token:</strong> {session.refresh_token ? '✅ Present' : '❌ Missing'}</p>
          <p><strong>Token Type:</strong> {session.token_type}</p>
          <p><strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
          <p><strong>Time Until Expiry:</strong> {Math.round((session.expires_at! * 1000 - Date.now()) / 1000 / 60)} minutes</p>
          
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Full Session Data</summary>
            <pre style={{ fontSize: '11px', overflow: 'auto', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '3px' }}>
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Debug Info */}
      <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '5px' }}>
        <h3>🐛 Debug Information</h3>
        <p><strong>Current URL:</strong> <code>{typeof window !== 'undefined' ? window.location.href : 'Server-side'}</code></p>
        <p><strong>Environment:</strong> {redirectConfig.environment}</p>
        <p><strong>Domain Detection:</strong> {redirectConfig.domain || 'Not detected'}</p>
        <p><strong>Subdomain:</strong> {redirectConfig.subdomain || 'None'}</p>
        <p><strong>Dynamic Redirect:</strong> <code>{redirectConfig.url}</code></p>
        <p><strong>Console:</strong> Check browser console for detailed logs</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      </div>
    </div>
  )
}