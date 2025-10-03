import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://pyqcvvqnnjljdcmnseux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cWN2dnFubmpsamRjbW5zZXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTc1NTksImV4cCI6MjA3NDg3MzU1OX0.YYFnKXEfbO10PBYAIPCdkSzkXf1SlDaCaqFqXK-18JI';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// ============================================
// 类型定义
// ============================================

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface AITwin {
  id: string;
  user_id: string;
  name: string;
  avatar: string | null;
  profile: {
    gender: string;
    age: string;
    occupation: string;
    location: string;
  };
  goals: string[];
  offers: string[];
  lookings: string[];
  memories: Memory[];
  // 向后兼容
  goal_recently?: string;
  value_offered?: string;
  value_desired?: string;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  content: string;
  source: 'chat_summary' | 'user_input' | 'conversation';
  timestamp: string;
  groupName?: string;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  answers: Record<string, any>;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  partner_twin_id: string | null;
  partner_name: string | null;
  messages: Array<{
    sender: string;
    content: string;
    timestamp: string;
  }>;
  matching_scores: {
    compatibility: number;
    valueAlignment: number;
    goalSynergy: number;
    overall: number;
    reasoning?: string;
  } | null;
  summary: string | null;
  recommended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
}

export interface Group {
  id: string;
  name: string;
  avatar: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string | null;
  sender_name: string | null;
  content: string;
  created_at: string;
}

// ============================================
// 数据库辅助函数
// ============================================

/**
 * 获取或创建用户记录
 */
export async function getOrCreateUser(googleUser: {
  sub: string;
  email: string;
  name: string;
  picture: string;
}) {
  // 先尝试查找用户
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('google_id', googleUser.sub)
    .single();

  if (existingUser) {
    return { user: existingUser, error: null };
  }

  // 用户不存在，创建新用户
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      google_id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    })
    .select()
    .single();

  return { user: newUser, error: createError };
}

/**
 * 获取用户的AI Twin
 */
export async function getAITwin(userId: string) {
  const { data, error } = await supabase
    .from('ai_twins')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 将数据库字段转换为前端格式（camelCase）
  if (data) {
    const transformedData = {
      ...data,
      goalRecently: data.goal_recently,
      valueOffered: data.value_offered,
      valueDesired: data.value_desired,
      // 删除下划线格式的字段
      goal_recently: undefined,
      value_offered: undefined,
      value_desired: undefined
    };
    
    // 清理undefined字段
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });
    
    return { data: transformedData, error };
  }

  return { data, error };
}

/**
 * 创建或更新AI Twin
 */
export async function upsertAITwin(userId: string, aiTwinData: any) {
  console.log('🔍 upsertAITwin called with userId:', userId);
  console.log('🔍 Raw aiTwinData:', aiTwinData);
  
  // 只保留数据库中存在的字段
  const dbFields = {
    user_id: userId,
    name: aiTwinData.name,
    avatar: aiTwinData.avatar,
    profile: aiTwinData.profile,
    goals: aiTwinData.goals || [],
    offers: aiTwinData.offers || [],
    lookings: aiTwinData.lookings || [],
    memories: aiTwinData.memories || [],
    // 向后兼容字段
    goal_recently: aiTwinData.goalRecently,
    value_offered: aiTwinData.valueOffered,
    value_desired: aiTwinData.valueDesired,
    updated_at: new Date().toISOString()
  };

  // 移除undefined值
  Object.keys(dbFields).forEach(key => {
    if (dbFields[key as keyof typeof dbFields] === undefined) {
      delete dbFields[key as keyof typeof dbFields];
    }
  });

  console.log('🔍 Cleaned dbFields:', dbFields);
  console.log('🔍 Field types:', {
    name: typeof dbFields.name,
    avatar: typeof dbFields.avatar,
    profile: typeof dbFields.profile,
    goals: Array.isArray(dbFields.goals),
    offers: Array.isArray(dbFields.offers),
    lookings: Array.isArray(dbFields.lookings)
  });

  const { data, error } = await supabase
    .from('ai_twins')
    .upsert(
      dbFields,
      {
        onConflict: 'user_id', // 指定冲突字段（因为有 unique_user_ai_twin 约束）
        ignoreDuplicates: false // 当冲突时更新而不是忽略
      }
    )
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase upsert error:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Supabase upsert success:', data);
  }

  return { data, error };
}

/**
 * 获取用户的Onboarding进度
 */
export async function getOnboardingProgress(userId: string) {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * 保存Onboarding进度
 */
export async function saveOnboardingProgress(
  userId: string,
  answers: Record<string, any>,
  completed: boolean = false
) {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .upsert(
      {
        user_id: userId,
        answers,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id', // 指定冲突字段
        ignoreDuplicates: false // 当冲突时更新而不是忽略
      }
    )
    .select()
    .single();

  return { data, error };
}

/**
 * 获取用户的对话历史
 */
export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * 保存AI对话
 */
export async function saveConversation(conversationData: Partial<AIConversation>) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert(conversationData)
    .select()
    .single();

  return { data, error };
}

/**
 * 获取所有AI Twins（用于匹配）
 */
export async function getAllAITwins(excludeUserId?: string) {
  let query = supabase
    .from('ai_twins')
    .select('*');

  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }

  const { data, error } = await query;
  
  // 将数据库字段转换为前端格式
  if (data && Array.isArray(data)) {
    const transformedData = data.map((item: any) => ({
      ...item,
      goalRecently: item.goal_recently,
      valueOffered: item.value_offered,
      valueDesired: item.value_desired,
      // 删除下划线格式的字段（保持数据干净）
      goal_recently: undefined,
      value_offered: undefined,
      value_desired: undefined
    }));
    
    // 清理每个对象的undefined字段
    transformedData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (item[key] === undefined) {
          delete item[key];
        }
      });
    });
    
    return { data: transformedData, error };
  }
  
  return { data, error };
}

/**
 * 检查是否已存在待处理的邀请
 */
export async function checkExistingInvitation(
  senderId: string,
  recipientId: string
) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('sender_id', senderId)
    .eq('recipient_id', recipientId)
    .eq('status', 'pending')
    .maybeSingle();

  return { data, error };
}

/**
 * 发送邀请
 */
export async function sendInvitation(
  senderId: string,
  recipientId: string,
  message?: string
) {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      message,
      status: 'pending'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * 更新邀请状态
 */
export async function updateInvitationStatus(
  invitationId: string,
  status: 'accepted' | 'declined'
) {
  const { data, error } = await supabase
    .from('invitations')
    .update({
      status,
      accepted_at: status === 'accepted' ? new Date().toISOString() : null
    })
    .eq('id', invitationId)
    .select()
    .single();

  return { data, error };
}

/**
 * 获取用户的邀请
 */
export async function getInvitations(userId: string, type: 'sent' | 'received') {
  const column = type === 'sent' ? 'sender_id' : 'recipient_id';
  
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * 创建群组
 */
export async function createGroup(
  name: string,
  createdBy: string,
  avatar?: string
) {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      created_by: createdBy,
      avatar
    })
    .select()
    .single();

  if (groupError || !group) {
    return { data: null, error: groupError };
  }

  // 添加创建者为成员
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: createdBy
    });

  if (memberError) {
    return { data: null, error: memberError };
  }

  return { data: group, error: null };
}

/**
 * 添加群组成员
 */
export async function addGroupMember(groupId: string, userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId
    })
    .select()
    .single();

  return { data, error };
}

/**
 * 获取用户的群组
 */
export async function getUserGroups(userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId);

  return { data: data?.map(item => item.groups), error };
}

/**
 * 获取群组消息
 */
export async function getGroupMessages(groupId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(limit);

  return { data, error };
}

/**
 * 发送群组消息
 */
export async function sendGroupMessage(
  groupId: string,
  senderId: string,
  senderName: string,
  content: string
) {
  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      sender_id: senderId,
      sender_name: senderName,
      content
    })
    .select()
    .single();

  return { data, error };
}

/**
 * 订阅群组消息（实时）
 */
export function subscribeToGroupMessages(
  groupId: string,
  callback: (message: GroupMessage) => void
) {
  const channel = supabase
    .channel(`group_messages:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      },
      (payload) => {
        callback(payload.new as GroupMessage);
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// 认证辅助函数
// ============================================

/**
 * 获取当前会话
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * 登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * 删除用户账号及所有相关数据
 * 注意：这是一个不可逆的操作
 */
export async function deleteUserAccount(userId: string) {
  try {
    console.log('🗑️ 开始删除用户账号及所有数据...', userId);

    // 1. 删除用户的 AI Twin
    const { error: aiTwinError } = await supabase
      .from('ai_twins')
      .delete()
      .eq('user_id', userId);
    
    if (aiTwinError) {
      console.error('❌ 删除 AI Twin 失败:', aiTwinError);
      throw aiTwinError;
    }
    console.log('✅ AI Twin 已删除');

    // 2. 删除用户的 Onboarding 进度
    const { error: onboardingError } = await supabase
      .from('onboarding_progress')
      .delete()
      .eq('user_id', userId);
    
    if (onboardingError) {
      console.error('❌ 删除 Onboarding 进度失败:', onboardingError);
      throw onboardingError;
    }
    console.log('✅ Onboarding 进度已删除');

    // 3. 删除用户的 Memories（如果表存在）
    const { error: memoriesError } = await supabase
      .from('memories')
      .delete()
      .eq('user_id', userId);
    
    if (memoriesError) {
      // 如果是 404 错误（表不存在），则忽略
      if (memoriesError.code === 'PGRST116' || memoriesError.message?.includes('not found')) {
        console.log('⚠️ Memories 表不存在或无数据，跳过删除');
      } else {
        console.error('❌ 删除 Memories 失败:', memoriesError);
        // 不抛出错误，继续执行
      }
    } else {
      console.log('✅ Memories 已删除');
    }

    // 4. 删除用户的对话历史（如果表存在）
    const { error: conversationsError } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('user_id', userId);
    
    if (conversationsError) {
      if (conversationsError.code === 'PGRST116' || conversationsError.message?.includes('not found')) {
        console.log('⚠️ AI Conversations 表不存在或无数据，跳过删除');
      } else {
        console.error('❌ 删除对话历史失败:', conversationsError);
        // 不抛出错误，继续执行
      }
    } else {
      console.log('✅ 对话历史已删除');
    }

    // 5. 删除用户作为成员的所有群组关系
    const { error: groupMembersError } = await supabase
      .from('group_members')
      .delete()
      .eq('user_id', userId);
    
    if (groupMembersError) {
      if (groupMembersError.code === 'PGRST116' || groupMembersError.message?.includes('not found')) {
        console.log('⚠️ Group Members 表不存在或无数据，跳过删除');
      } else {
        console.error('❌ 删除群组成员关系失败:', groupMembersError);
        // 不抛出错误，继续执行
      }
    } else {
      console.log('✅ 群组成员关系已删除');
    }

    // 6. 删除用户创建的群组
    const { error: groupsError } = await supabase
      .from('groups')
      .delete()
      .eq('created_by', userId);
    
    if (groupsError) {
      if (groupsError.code === 'PGRST116' || groupsError.message?.includes('not found')) {
        console.log('⚠️ Groups 表不存在或无数据，跳过删除');
      } else {
        console.error('❌ 删除群组失败:', groupsError);
        // 不抛出错误，继续执行
      }
    } else {
      console.log('✅ 用户创建的群组已删除');
    }

    // 7. 删除用户发送和接收的邀请
    const { error: sentInvitationsError } = await supabase
      .from('invitations')
      .delete()
      .eq('sender_id', userId);
    
    if (sentInvitationsError) {
      if (sentInvitationsError.code === 'PGRST116' || sentInvitationsError.message?.includes('not found')) {
        console.log('⚠️ Invitations 表不存在或无数据（发送），跳过删除');
      } else {
        console.error('❌ 删除发送的邀请失败:', sentInvitationsError);
        // 不抛出错误，继续执行
      }
    } else {
      console.log('✅ 发送的邀请已删除');
    }

    const { error: receivedInvitationsError } = await supabase
      .from('invitations')
      .delete()
      .eq('recipient_id', userId);
    
    if (receivedInvitationsError) {
      if (receivedInvitationsError.code === 'PGRST116' || receivedInvitationsError.message?.includes('not found')) {
        console.log('⚠️ Invitations 表不存在或无数据（接收），跳过删除');
      } else {
        console.error('❌ 删除接收的邀请失败:', receivedInvitationsError);
        // 不抛出错误，继续执行
      }
    } else {
      console.log('✅ 接收的邀请已删除');
    }

    // 8. 最后删除用户记录
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (userError) {
      console.error('❌ 删除用户记录失败:', userError);
      throw userError;
    }
    console.log('✅ 用户记录已删除');

    console.log('✅ 所有用户数据已成功删除');
    return { error: null };

  } catch (error) {
    console.error('❌ 删除用户账号失败:', error);
    return { error };
  }
}

/**
 * 检查用户是否已完成 Onboarding
 */
export async function checkOnboardingCompleted(userId: string): Promise<{ completed: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ 检查 Onboarding 状态失败:', error);
      return { completed: false, error };
    }

    // 如果没有记录，说明用户还没开始 onboarding
    if (!data) {
      return { completed: false, error: null };
    }

    return { completed: data.completed || false, error: null };
  } catch (error) {
    console.error('❌ 检查 Onboarding 状态异常:', error);
    return { completed: false, error };
  }
}

