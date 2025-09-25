import React from 'react';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const GoogleAuthDebug: React.FC = () => {
  const { isGoogleReady, isLoading, error, initializeGoogle } = useGoogleAuth();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const currentUrl = window.location.origin;

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <XCircle className="w-4 h-4 text-red-500" />;
    if (isGoogleReady) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Loading...';
    if (error) return 'Error';
    if (isGoogleReady) return 'Ready';
    return 'Not Ready';
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Google Authentication Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Configuration</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Client ID:</span>
                <span className="font-mono text-xs">
                  {clientId ? `${clientId.substring(0, 12)}...` : 'Not Set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current URL:</span>
                <span className="font-mono text-xs">{currentUrl}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Status</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Google Ready:</span>
                <span className={isGoogleReady ? 'text-green-600' : 'text-red-600'}>
                  {isGoogleReady ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Loading:</span>
                <span>{isLoading ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Requirements */}
        <div>
          <h4 className="font-medium mb-2">Google Cloud Console Requirements</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Make sure your Google OAuth client is configured with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code>http://localhost:5173</code> in Authorized JavaScript origins</li>
              <li><code>http://localhost:3000</code> (if using different port)</li>
              <li>Your production domain when deploying</li>
            </ul>
          </div>
        </div>

        {/* Retry Button */}
        <div className="flex gap-2">
          <Button 
            onClick={initializeGoogle} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Retry Initialization
          </Button>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Reload Page
          </Button>
        </div>

        {/* Debug Information */}
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">Debug Information</summary>
          <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
            <pre>{JSON.stringify({
              clientId: clientId ? `${clientId.substring(0, 20)}...` : null,
              currentUrl,
              isGoogleReady,
              isLoading,
              error,
              userAgent: navigator.userAgent.substring(0, 50) + '...',
              googleScriptLoaded: !!window.google?.accounts?.id,
            }, null, 2)}</pre>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
