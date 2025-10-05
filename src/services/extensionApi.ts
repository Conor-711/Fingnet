import { supabase } from '@/lib/supabase';

/**
 * 扩展 API 服务
 * 提供插件专用的 API 接口
 */

export interface ExtensionProfile {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  google_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExtensionAITwin {
  id: string;
  name: string;
  avatar: string | null;
  personality?: string;
  goals?: string[];
  offers?: string[];
  lookings?: string[];
}

export interface ExtensionUserData {
  profile: ExtensionProfile;
  aiTwin: ExtensionAITwin | null;
  needsOnboarding: boolean;
}

/**
 * 验证 Token 是否有效
 */
export async function verifyExtensionToken(accessToken: string): Promise<{
  valid: boolean;
  userId?: string;
  expiresAt?: number;
  error?: string;
}> {
  try {
    // 使用提供的 token 创建临时 client
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return {
        valid: false,
        error: error?.message || 'Invalid token'
      };
    }

    return {
      valid: true,
      userId: user.id,
      expiresAt: user.app_metadata?.exp
    };
  } catch (error) {
    console.error('❌ Token 验证失败:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 获取用户完整资料（供插件使用）
 */
export async function getExtensionProfile(accessToken?: string): Promise<{
  success: boolean;
  data?: ExtensionUserData;
  error?: string;
}> {
  try {
    // 如果提供了 token，先验证
    if (accessToken) {
      const { valid, error } = await verifyExtensionToken(accessToken);
      if (!valid) {
        return {
          success: false,
          error: error || 'Invalid token'
        };
      }
    }

    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return {
        success: false,
        error: userError?.message || 'User not found'
      };
    }

    // 查询用户资料
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        error: profileError.message
      };
    }

    // 查询 AI Twin
    const { data: aiTwinData } = await supabase
      .from('ai_twins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 检查 onboarding 状态
    const { data: onboardingData } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const needsOnboarding = !onboardingData || !onboardingData.completed;

    let aiTwin: ExtensionAITwin | null = null;
    if (aiTwinData) {
      aiTwin = {
        id: aiTwinData.id,
        name: aiTwinData.name,
        avatar: aiTwinData.avatar,
        personality: aiTwinData.personality,
        goals: aiTwinData.goals,
        offers: aiTwinData.offers,
        lookings: aiTwinData.lookings
      };
    }

    return {
      success: true,
      data: {
        profile,
        aiTwin,
        needsOnboarding
      }
    };
  } catch (error) {
    console.error('❌ 获取用户资料失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 更新用户资料（供插件使用）
 */
export async function updateExtensionProfile(
  updates: {
    name?: string;
    picture?: string;
  },
  accessToken?: string
): Promise<{
  success: boolean;
  data?: ExtensionProfile;
  error?: string;
}> {
  try {
    // 如果提供了 token，先验证
    if (accessToken) {
      const { valid, error } = await verifyExtensionToken(accessToken);
      if (!valid) {
        return {
          success: false,
          error: error || 'Invalid token'
        };
      }
    }

    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return {
        success: false,
        error: userError?.message || 'User not found'
      };
    }

    // 更新用户资料
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
      sync_source: 'extension'
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    console.log('✅ 用户资料已更新（来自插件）:', updatedProfile);

    return {
      success: true,
      data: updatedProfile
    };
  } catch (error) {
    console.error('❌ 更新用户资料失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 刷新 Token
 */
export async function refreshExtensionToken(refreshToken: string): Promise<{
  success: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
  };
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      return {
        success: false,
        error: error?.message || 'Failed to refresh token'
      };
    }

    return {
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        expires_in: data.session.expires_in || 0
      }
    };
  } catch (error) {
    console.error('❌ Token 刷新失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 检查用户数据同步状态
 */
export async function checkExtensionSyncStatus(userId: string): Promise<{
  needsSync: boolean;
  lastSyncedAt?: string;
  syncSource?: string;
}> {
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('updated_at, last_synced_at, sync_source')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { needsSync: true };
    }

    // 如果从未同步过，需要同步
    if (!profile.last_synced_at) {
      return { needsSync: true };
    }

    // 如果更新时间晚于同步时间，需要同步
    const updatedAt = new Date(profile.updated_at).getTime();
    const syncedAt = new Date(profile.last_synced_at).getTime();
    const needsSync = updatedAt > syncedAt;

    return {
      needsSync,
      lastSyncedAt: profile.last_synced_at,
      syncSource: profile.sync_source
    };
  } catch (error) {
    console.error('❌ 检查同步状态失败:', error);
    return { needsSync: true };
  }
}
