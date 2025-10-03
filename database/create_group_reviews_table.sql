-- Create group_reviews table for storing user reviews of their group connections
CREATE TABLE IF NOT EXISTS group_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每个用户对每个群组只能有一个评价
  UNIQUE(user_id, group_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_group_reviews_user_id ON group_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_group_reviews_group_id ON group_reviews(group_id);
CREATE INDEX IF NOT EXISTS idx_group_reviews_rating ON group_reviews(rating);

-- 添加注释
COMMENT ON TABLE group_reviews IS 'Stores user reviews and ratings for their group connections';
COMMENT ON COLUMN group_reviews.user_id IS 'The user who wrote the review';
COMMENT ON COLUMN group_reviews.group_id IS 'The group being reviewed';
COMMENT ON COLUMN group_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN group_reviews.review_text IS 'Optional text review';

