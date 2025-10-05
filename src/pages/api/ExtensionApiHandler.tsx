import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  verifyExtensionToken, 
  getExtensionProfile, 
  updateExtensionProfile,
  refreshExtensionToken 
} from '@/services/extensionApi';

/**
 * API 处理页面
 * 用于处理插件的 API 请求
 * 
 * 支持的端点:
 * - /api/extension?action=verify&token=xxx
 * - /api/extension?action=profile&token=xxx
 * - /api/extension?action=update&token=xxx&name=xxx&picture=xxx
 * - /api/extension?action=refresh&refresh_token=xxx
 */
export default function ExtensionApiHandler() {
  const [searchParams] = useSearchParams();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleApiRequest = async () => {
      try {
        const action = searchParams.get('action');
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh_token');

        console.log('🔧 API Request:', { action, hasToken: !!token });

        switch (action) {
          case 'verify': {
            if (!token) {
              throw new Error('Missing token');
            }
            const result = await verifyExtensionToken(token);
            setResponse(result);
            break;
          }

          case 'profile': {
            if (!token) {
              throw new Error('Missing token');
            }
            const result = await getExtensionProfile(token);
            setResponse(result);
            break;
          }

          case 'update': {
            if (!token) {
              throw new Error('Missing token');
            }
            const name = searchParams.get('name');
            const picture = searchParams.get('picture');
            
            const updates: any = {};
            if (name) updates.name = name;
            if (picture) updates.picture = picture;

            const result = await updateExtensionProfile(updates, token);
            setResponse(result);
            break;
          }

          case 'refresh': {
            if (!refreshToken) {
              throw new Error('Missing refresh_token');
            }
            const result = await refreshExtensionToken(refreshToken);
            setResponse(result);
            break;
          }

          default:
            throw new Error('Invalid action');
        }
      } catch (error) {
        console.error('❌ API Error:', error);
        setResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    handleApiRequest();
  }, [searchParams]);

  // 返回 JSON 响应
  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'monospace', 
        padding: '20px',
        background: '#1a1a1a',
        color: '#00ff00',
        minHeight: '100vh'
      }}>
        <pre>Loading...</pre>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      background: '#1a1a1a',
      color: '#00ff00',
      minHeight: '100vh'
    }}>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
