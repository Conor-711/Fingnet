import { OnboardingQuestion } from '@/types/post';

// Onboarding问题数据 - 15个问题
export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'age',
    type: 'single-choice',
    title: 'What is your age?',
    required: true,
    options: [
      {
        id: 'age-18-24',
        label: '18-24',
        value: '18-24',
        avatar: {
          src: '🎓',
          alt: '18-24',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'age-25-34',
        label: '25-34',
        value: '25-34',
        avatar: {
          src: '☕',
          alt: '25-34',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'age-35-44',
        label: '35-44',
        value: '35-44',
        avatar: {
          src: '😎',
          alt: '35-44',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'age-45-plus',
        label: '45+',
        value: '45+',
        avatar: {
          src: '🧢',
          alt: '45+',
          bgColor: 'bg-purple-100'
        }
      }
    ]
  },
  {
    id: 'gender',
    type: 'single-choice',
    title: 'Select your gender',
    required: true,
    options: [
      {
        id: 'female',
        label: 'Female',
        value: 'female',
        avatar: {
          src: '👩',
          alt: 'Female',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'male',
        label: 'Male',
        value: 'male',
        avatar: {
          src: '👨',
          alt: 'Male',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'non-binary',
        label: 'Non-binary',
        value: 'non-binary',
        avatar: {
          src: '🌈',
          alt: 'Non-binary',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'prefer-not-say',
        label: 'Prefer not to say',
        value: 'prefer-not-say',
        avatar: {
          src: '🤫',
          alt: 'Prefer not to say',
          bgColor: 'bg-gray-100'
        }
      }
    ]
  },
  {
    id: 'areas-to-elevate',
    type: 'multiple-choice',
    title: 'Choose areas you\'d like to elevate',
    subtitle: 'The choice won\'t limit your experience',
    required: true,
    options: [
      {
        id: 'emotions',
        label: 'Emotions',
        value: 'emotions'
      },
      {
        id: 'motivation',
        label: 'Motivation',
        value: 'motivation'
      },
      {
        id: 'nutrition',
        label: 'Nutrition',
        value: 'nutrition'
      },
      {
        id: 'habits',
        label: 'Habits',
        value: 'habits'
      },
      {
        id: 'confidence',
        label: 'Confidence',
        value: 'confidence'
      },
      {
        id: 'mindset',
        label: 'Mindset',
        value: 'mindset'
      },
      {
        id: 'self-care',
        label: 'Self-care',
        value: 'self-care'
      },
      {
        id: 'exercise',
        label: 'Exercise',
        value: 'exercise'
      },
      {
        id: 'empathy',
        label: 'Empathy',
        value: 'empathy'
      },
      {
        id: 'love-relationships',
        label: 'Love & relationships',
        value: 'love-relationships'
      },
      {
        id: 'personal-finance',
        label: 'Personal finance',
        value: 'personal-finance'
      },
      {
        id: 'creativity',
        label: 'Creativity',
        value: 'creativity'
      }
    ]
  },
  {
    id: 'inspiration',
    type: 'single-choice',
    title: 'Whose life principles, success, and personality inspire you the most?',
    required: false,
    options: [
      {
        id: 'steve-jobs',
        label: 'Steve Jobs',
        value: 'steve-jobs',
        avatar: {
          src: '/src/assets/cele/steve_jobs.png',
          alt: 'Steve Jobs',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'richard-branson',
        label: 'Richard Branson',
        value: 'richard-branson',
        avatar: {
          src: '/src/assets/cele/rechard.png',
          alt: 'Richard Branson',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'lebron-james',
        label: 'LeBron James',
        value: 'lebron-james',
        avatar: {
          src: '/src/assets/cele/lebron.png',
          alt: 'LeBron James',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'oprah-winfrey',
        label: 'Oprah Winfrey',
        value: 'oprah-winfrey',
        avatar: {
          src: '/src/assets/cele/Oprah.png',
          alt: 'Oprah Winfrey',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'emma-watson',
        label: 'Emma Watson',
        value: 'emma-watson',
        avatar: {
          src: '/src/assets/cele/emma.png',
          alt: 'Emma Watson',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'serena-williams',
        label: 'Serena Williams',
        value: 'serena-williams',
        avatar: {
          src: '/src/assets/cele/serena.png',
          alt: 'Serena Williams',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'jeff-bezos',
        label: 'Jeff Bezos',
        value: 'jeff-bezos',
        avatar: {
          src: '/src/assets/cele/jeff.png',
          alt: 'Jeff Bezos',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'kevin-hart',
        label: 'Kevin Hart',
        value: 'kevin-hart',
        avatar: {
          src: '/src/assets/cele/kevin.png',
          alt: 'Kevin Hart',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'brene-brown',
        label: 'Brené Brown',
        value: 'brene-brown',
        avatar: {
          src: '/src/assets/cele/brown.png',
          alt: 'Brené Brown',
          bgColor: 'bg-teal-100'
        }
      }
    ]
  },
  {
    id: 'thinking-style',
    type: 'single-choice',
    title: 'Are you a big-picture or detail-oriented person?',
    required: false,
    options: [
      {
        id: 'big-picture',
        label: 'Big-picture thinker',
        value: 'big-picture',
        avatar: {
          src: '🌅',
          alt: 'Big picture',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'detail-oriented',
        label: 'Detail-oriented',
        value: 'detail-oriented',
        avatar: {
          src: '🔍',
          alt: 'Detail oriented',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'balanced',
        label: 'Balanced approach',
        value: 'balanced',
        avatar: {
          src: '⚖️',
          alt: 'Balanced',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'clarity',
    type: 'single-choice',
    title: 'Do you always know exactly what you want?',
    required: false,
    options: [
      {
        id: 'never-know',
        label: 'Never know',
        value: 'never-know',
        avatar: {
          src: '👎',
          alt: 'Never know',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'rarely-know',
        label: 'Rarely know',
        value: 'rarely-know',
        avatar: {
          src: '👎',
          alt: 'Rarely know',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'sometimes-unsure',
        label: 'Sometimes unsure',
        value: 'sometimes-unsure',
        avatar: {
          src: '🤷',
          alt: 'Sometimes unsure',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'usually-know',
        label: 'Usually know',
        value: 'usually-know',
        avatar: {
          src: '👍',
          alt: 'Usually know',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'always-know',
        label: 'Always know',
        value: 'always-know',
        avatar: {
          src: '👍',
          alt: 'Always know',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'personality-type',
    type: 'single-choice',
    title: 'Which describes you best?',
    required: false,
    options: [
      {
        id: 'leader',
        label: 'Leader',
        value: 'leader',
        avatar: {
          src: '🚀',
          alt: 'Leader',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'follower',
        label: 'Follower',
        value: 'follower',
        avatar: {
          src: '👣',
          alt: 'Follower',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'both',
        label: 'A bit of both',
        value: 'both',
        avatar: {
          src: '😎',
          alt: 'A bit of both',
          bgColor: 'bg-purple-100'
        }
      }
    ]
  },
  {
    id: 'self-perception',
    type: 'single-choice',
    title: 'What do you consider yourself?',
    required: false,
    options: [
      {
        id: 'extrovert',
        label: 'Extrovert',
        value: 'extrovert',
        avatar: {
          src: '😊',
          alt: 'Extrovert',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'introvert',
        label: 'Introvert',
        value: 'introvert',
        avatar: {
          src: '😌',
          alt: 'Introvert',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'both',
        label: 'Both',
        value: 'both',
        avatar: {
          src: '🤔',
          alt: 'Both',
          bgColor: 'bg-purple-100'
        }
      }
    ]
  },
  {
    id: 'motivation-style',
    type: 'single-choice',
    title: 'Do you sometimes need a friendly push to keep moving forward?',
    required: false,
    options: [
      {
        id: 'never-need-push',
        label: 'Never need push',
        value: 'never-need-push',
        avatar: {
          src: '👎',
          alt: 'Never need push',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'rarely-need-push',
        label: 'Rarely need push',
        value: 'rarely-need-push',
        avatar: {
          src: '👎',
          alt: 'Rarely need push',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'sometimes-need-push',
        label: 'Sometimes need push',
        value: 'sometimes-need-push',
        avatar: {
          src: '🤷',
          alt: 'Sometimes need push',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'often-need-push',
        label: 'Often need push',
        value: 'often-need-push',
        avatar: {
          src: '👍',
          alt: 'Often need push',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'always-need-push',
        label: 'Always need push',
        value: 'always-need-push',
        avatar: {
          src: '👍',
          alt: 'Always need push',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'success-preference',
    type: 'single-choice',
    title: 'When you succeed in something, you\'d rather...',
    required: false,
    options: [
      {
        id: 'public-recognition',
        label: 'Get public recognition',
        value: 'public-recognition',
        avatar: {
          src: '🏆',
          alt: 'Public recognition',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'personal-satisfaction',
        label: 'Feel personal satisfaction',
        value: 'personal-satisfaction',
        avatar: {
          src: '😊',
          alt: 'Personal satisfaction',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'team-success',
        label: 'Share success with others',
        value: 'team-success',
        avatar: {
          src: '👥',
          alt: 'Team success',
          bgColor: 'bg-blue-100'
        }
      }
    ]
  },
  {
    id: 'profession',
    type: 'single-choice',
    title: 'What is your profession?',
    required: false,
    options: [
      {
        id: 'tech',
        label: 'Technology',
        value: 'tech',
        avatar: {
          src: '💻',
          alt: 'Technology',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'business',
        label: 'Business & Finance',
        value: 'business',
        avatar: {
          src: '📈',
          alt: 'Business & Finance',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'healthcare',
        label: 'Healthcare',
        value: 'healthcare',
        avatar: {
          src: '🏥',
          alt: 'Healthcare',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'education',
        label: 'Education',
        value: 'education',
        avatar: {
          src: '📚',
          alt: 'Education',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'creative',
        label: 'Creative Arts',
        value: 'creative',
        avatar: {
          src: '🎨',
          alt: 'Creative Arts',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'engineering',
        label: 'Engineering',
        value: 'engineering',
        avatar: {
          src: '⚙️',
          alt: 'Engineering',
          bgColor: 'bg-gray-100'
        }
      },
      {
        id: 'legal',
        label: 'Legal',
        value: 'legal',
        avatar: {
          src: '⚖️',
          alt: 'Legal',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'sales',
        label: 'Sales & Marketing',
        value: 'sales',
        avatar: {
          src: '📊',
          alt: 'Sales & Marketing',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'other',
        label: 'Other',
        value: 'other',
        avatar: {
          src: '🎯',
          alt: 'Other',
          bgColor: 'bg-yellow-100'
        }
      }
    ]
  },
  {
    id: 'job-satisfaction',
    type: 'single-choice',
    title: 'Do you like your job?',
    required: false,
    options: [
      {
        id: 'hate-job',
        label: 'Hate it',
        value: 'hate-job',
        avatar: {
          src: '👎',
          alt: 'Hate job',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'dislike-job',
        label: 'Dislike it',
        value: 'dislike-job',
        avatar: {
          src: '👎',
          alt: 'Dislike job',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'neutral-job',
        label: 'It\'s okay',
        value: 'neutral-job',
        avatar: {
          src: '🤷',
          alt: 'Neutral job',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'like-job',
        label: 'Like it',
        value: 'like-job',
        avatar: {
          src: '👍',
          alt: 'Like job',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'love-job',
        label: 'Love it',
        value: 'love-job',
        avatar: {
          src: '👍',
          alt: 'Love job',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'work-life-balance',
    type: 'single-choice',
    title: 'Do you maintain a healthy work-life balance?',
    required: false,
    options: [
      {
        id: 'poor-balance',
        label: 'Poor balance',
        value: 'poor-balance',
        avatar: {
          src: '👎',
          alt: 'Poor balance',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'needs-improvement',
        label: 'Needs improvement',
        value: 'needs-improvement',
        avatar: {
          src: '👎',
          alt: 'Needs improvement',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'neutral-balance',
        label: 'It\'s okay',
        value: 'neutral-balance',
        avatar: {
          src: '🤷',
          alt: 'Neutral balance',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'good-balance',
        label: 'Good balance',
        value: 'good-balance',
        avatar: {
          src: '👍',
          alt: 'Good balance',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'excellent-balance',
        label: 'Excellent balance',
        value: 'excellent-balance',
        avatar: {
          src: '👍',
          alt: 'Excellent balance',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'financial-satisfaction',
    type: 'single-choice',
    title: 'Do you feel good about your finances?',
    required: false,
    options: [
      {
        id: 'very-stressed',
        label: 'Very stressed',
        value: 'very-stressed',
        avatar: {
          src: '👎',
          alt: 'Very stressed',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'stressed',
        label: 'Stressed',
        value: 'stressed',
        avatar: {
          src: '👎',
          alt: 'Stressed',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'neutral-finances',
        label: 'It\'s okay',
        value: 'neutral-finances',
        avatar: {
          src: '🤷',
          alt: 'Neutral finances',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'comfortable',
        label: 'Comfortable',
        value: 'comfortable',
        avatar: {
          src: '👍',
          alt: 'Comfortable',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'very-comfortable',
        label: 'Very comfortable',
        value: 'very-comfortable',
        avatar: {
          src: '👍',
          alt: 'Very comfortable',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'work-preference',
    type: 'single-choice',
    title: 'Do you think you\'re better at working independently or collaborating with others?',
    required: false,
    options: [
      {
        id: 'strongly-independent',
        label: 'Strongly prefer independent work',
        value: 'strongly-independent',
        avatar: {
          src: '👎',
          alt: 'Strongly independent',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'prefer-independent',
        label: 'Prefer independent work',
        value: 'prefer-independent',
        avatar: {
          src: '👎',
          alt: 'Prefer independent',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'neutral-preference',
        label: 'No strong preference',
        value: 'neutral-preference',
        avatar: {
          src: '🤷',
          alt: 'Neutral preference',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'prefer-collaborative',
        label: 'Prefer collaborative work',
        value: 'prefer-collaborative',
        avatar: {
          src: '👍',
          alt: 'Prefer collaborative',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'strongly-collaborative',
        label: 'Strongly prefer collaborative work',
        value: 'strongly-collaborative',
        avatar: {
          src: '👍',
          alt: 'Strongly collaborative',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'daily-tools',
    type: 'multiple-choice',
    title: 'Which tools are part of your daily workflow?',
    required: false,
    options: [
      {
        id: 'notion',
        label: 'Notion',
        value: 'notion',
        avatar: {
          src: '/src/assets/tools/notion.png',
          alt: 'Notion',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'figma',
        label: 'Figma',
        value: 'figma',
        avatar: {
          src: '/src/assets/tools/figma.png',
          alt: 'Figma',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'cursor',
        label: 'Cursor',
        value: 'cursor',
        avatar: {
          src: '/src/assets/tools/cursor.png',
          alt: 'Cursor',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'canva',
        label: 'Canva',
        value: 'canva',
        avatar: {
          src: '/src/assets/tools/canva.png',
          alt: 'Canva',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'manus',
        label: 'Manus',
        value: 'manus',
        avatar: {
          src: '/src/assets/tools/manus.png',
          alt: 'Manus',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'nano',
        label: 'Nano',
        value: 'nano',
        avatar: {
          src: '/src/assets/tools/nano.png',
          alt: 'Nano',
          bgColor: 'bg-white'
        }
      }
    ]
  }
];

// 获取所有问题数量
export const getTotalQuestions = (): number => {
  return onboardingQuestions.length;
};

// 根据ID获取问题
export const getQuestionById = (id: string): OnboardingQuestion | undefined => {
  return onboardingQuestions.find(q => q.id === id);
};

// 获取下一个问题
export const getNextQuestion = (currentQuestionId: string): OnboardingQuestion | null => {
  const currentIndex = onboardingQuestions.findIndex(q => q.id === currentQuestionId);
  if (currentIndex === -1 || currentIndex >= onboardingQuestions.length - 1) {
    return null;
  }
  return onboardingQuestions[currentIndex + 1];
};

// 获取上一个问题
export const getPreviousQuestion = (currentQuestionId: string): OnboardingQuestion | null => {
  const currentIndex = onboardingQuestions.findIndex(q => q.id === currentQuestionId);
  if (currentIndex <= 0) {
    return null;
  }
  return onboardingQuestions[currentIndex - 1];
};

// AI朋友评论数据
export const aiFriendComments: Record<string, Record<string, string>> = {
  'age-18-24': {
    comment: "Wow, being young is amazing! At this age, you have endless possibilities. College life, first job, various new experiences... Remember to balance study and life well!"
  },
  'age-25-34': {
    comment: "This age range is the most exciting stage! Career beginnings, independent living, finding a partner... You're probably making many important life decisions right now. Can't wait to hear your stories!"
  },
  'age-35-44': {
    comment: "This stage is usually the most stable yet challenging period of life. Family, career, health... You must have many wonderful stories to share!"
  },
  'age-45-plus': {
    comment: "Age is just a number! The wisdom and experience you've accumulated at this stage are the most precious treasures. Would love to hear your life insights!"
  },
  'female': {
    comment: "Nice to meet you! As a woman, your stories and perspectives are invaluable. Hope to hear more of your sharing on OnlyMsg!"
  },
  'male': {
    comment: "Welcome to OnlyMsg! Looking forward to hearing your thoughts and experiences. Let's create interesting conversations together!"
  },
  'non-binary': {
    comment: "Thank you for choosing to share your authentic self! Everyone deserves to be respected and recognized. Your story matters!"
  },
  'prefer-not-say': {
    comment: "Completely understand! Everyone has their own privacy boundaries. We focus on your thoughts and experiences, not labels."
  },
  'emotions': {
    comment: "Emotional management is one of life's most important skills! Learning to understand and express emotions can make our lives richer and more colorful."
  },
  'motivation': {
    comment: "The secret to staying motivated varies from person to person. Find what truly inspires you and let it become your source of driving force!"
  },
  'nutrition': {
    comment: "Eating well means living well! Balanced nutrition is the foundation of health, but we should also enjoy the happiness that good food brings."
  },
  'habits': {
    comment: "Good habits shape our lives. The power of persistence is strong, but starting with small changes is the easiest way to succeed!"
  },
  'confidence': {
    comment: "Confidence comes from self-awareness and continuous trying. Everyone has their shining points, be brave to show your authentic self!"
  },
  'mindset': {
    comment: "Mindset determines destiny! A positive attitude helps us see more possibilities and makes us stronger when facing challenges."
  },
  'self-care': {
    comment: "Taking care of yourself is the most important investment. Both body and mind need gentle treatment, so we can better care for others."
  },
  'exercise': {
    comment: "Exercise is the best regulator for body and mind! Find a form of exercise you enjoy and make it part of your life."
  },
  'empathy': {
    comment: "Empathy is the bridge connecting people. Learning to think from others' perspectives can make the world warmer."
  },
  'love-relationships': {
    comment: "Love and relationships are the most beautiful parts of life. Learning to love yourself and others is a lifelong practice."
  },
  'personal-finance': {
    comment: "Financial management is a required course in life. Learning to manage money can bring us more freedom and security."
  },
  'creativity': {
    comment: "Creativity is the magic that makes life interesting! Everyone has creativity, express it bravely and you can create infinite possibilities."
  },
  'steve-jobs': {
    comment: "Steve Jobs is synonymous with innovation! His design philosophy and pursuit of perfection changed the entire tech industry, reminding us of the importance of 'thinking different'."
  },
  'richard-branson': {
    comment: "Richard Branson's adventurous spirit is admirable! He proved that life is not just about work, but more importantly about enjoying the process and being brave to try new things."
  },
  'lebron-james': {
    comment: "LeBron James is not only a basketball legend but also a business empire builder! His leadership and commitment to community show how athletes can impact the world."
  },
  'oprah-winfrey': {
    comment: "Oprah Winfrey's life story has inspired countless people! Her journey from poverty to media empire proves the power of resilience and authentic expression."
  },
  'emma-watson': {
    comment: "Emma Watson is not only an actress but also a feminist and education advocate! Her wisdom and pursuit of equality make her a role model for the younger generation."
  },
  'serena-williams': {
    comment: "Serena Williams is one of the greatest athletes in tennis history! Her resilience, strength, and commitment to family have inspired women worldwide."
  },
  'jeff-bezos': {
    comment: "Jeff Bezos' entrepreneurial story from bookstore to Amazon empire shows the importance of long-term vision and customer obsession. His innovative spirit changed the retail industry."
  },
  'kevin-hart': {
    comment: "Kevin Hart's humor and inspirational story are very encouraging! His journey from poverty to comedy superstar proves the power of persistence and optimism."
  },
  'brene-brown': {
    comment: "Brené Brown's vulnerability research changed our understanding of emotions! Her courage and wisdom help people build more authentic relationships."
  },
  'leader': {
    comment: "A natural leader! This trait is especially valuable in teamwork, able to drive everyone forward together."
  },
  'follower': {
    comment: "Excellent followers are often the cornerstone of teams! Knowing when to support others is also a kind of wisdom."
  },
  'both': {
    comment: "Flexible leadership style! Being able to adjust roles according to situations is a very mature ability."
  },
  'tech': {
    comment: "The tech industry is full of innovation and challenges! There are new technologies to learn every day, which keeps work from being boring."
  },
  'business': {
    comment: "The business world is full of opportunities and strategies! Your business acumen must be very sharp, able to see opportunities others can't."
  },
  'healthcare': {
    comment: "The healthcare industry is one of the most meaningful professions! Your work directly relates to people's health and lives, truly great."
  },
  'education': {
    comment: "Educators shape the future! Your work has far-reaching impact, cultivating generations of talent."
  },
  'creative': {
    comment: "Creative industries are full of passion and imagination! Your work makes the world more beautiful and people's lives more interesting."
  },
  'engineering': {
    comment: "Engineering requires rigorous thinking and innovative ability! Your work makes the impossible possible, really cool."
  },
  'legal': {
    comment: "The legal industry protects justice and order! Your work ensures social rules are followed, maintaining fairness and justice."
  },
  'sales': {
    comment: "Sales and marketing are full of challenges and fun! Your work requires communication skills and market insight."
  },
  'other': {
    comment: "Every profession has its unique value and meaning! No matter what work you do, you can contribute to society."
  },
  'big-picture': {
    comment: "Big picture thinkers can see the forest instead of trees! This perspective is especially valuable when making long-term plans."
  },
  'detail-oriented': {
    comment: "Detail-oriented people keep everything organized! This meticulousness is especially important when executing complex tasks."
  },
  'balanced': {
    comment: "Balancing various perspectives is an art! Being able to see both the whole and details is a precious ability."
  },
  'never-know': {
    comment: "Have no idea what you want? This might mean you're in a stage of exploration and self-discovery! This is actually a great state that can bring many possibilities."
  },
  'rarely-know': {
    comment: "Rarely know what you want? This is normal! Life is a continuous process of exploration and discovery. Keep an open mind, and you'll find your direction."
  },
  'sometimes-unsure': {
    comment: "Sometimes being uncertain is okay! This shows you're thinking and weighing different possibilities. This thoughtful attitude leads to better decisions."
  },
  'usually-know': {
    comment: "Usually knowing what you want is a great state! This clarity allows you to pursue goals more efficiently."
  },
  'always-know': {
    comment: "Always knowing what you want, this clear sense of purpose is powerful! It gives you clear direction and motivation."
  },
  'planner': {
    comment: "Strong planning skills keep things organized! This organizational ability is especially valuable in complex projects."
  },
  'spontaneous': {
    comment: "Strong spontaneity makes life full of surprises! This flexibility is especially important when adapting to changes."
  },
  'adaptable': {
    comment: "Strong adaptability is flexible like water! This ability is especially precious in constantly changing environments."
  },
  'optimist': {
    comment: "Optimists see the sunshine behind every cloud! This positive attitude can infect people around them."
  },
  'realist': {
    comment: "Realists are down-to-earth! This pragmatic attitude can bring reliable results."
  },
  'perfectionist': {
    comment: "Perfectionists pursue excellence! This persistence in quality can bring outstanding results."
  },
  'dreamer': {
    comment: "Dreamers create the future! Their vision and imagination are the source of innovation."
  },
  'never-need-push': {
    comment: "Strong self-motivation ability is powerful! This internal drive is the cornerstone of long-term success."
  },
  'rarely-need-push': {
    comment: "Rarely needing external motivation shows strong internal drive! This self-driven ability is very admirable."
  },
  'sometimes-need-push': {
    comment: "Occasionally needing some external motivation is normal! Knowing when you need help is a sign of maturity."
  },
  'often-need-push': {
    comment: "Often needing external motivation is okay! Finding the right source of motivation for yourself is important."
  },
  'always-need-push': {
    comment: "Always needing external motivation? This might mean you need to find a motivation system that suits you better. But this is also normal, everyone has their own rhythm."
  },
  'public-recognition': {
    comment: "Public recognition can motivate many people! This sense of achievement is especially important for some people."
  },
  'personal-satisfaction': {
    comment: "Internal satisfaction is more lasting! This sense of achievement comes from self-recognition."
  },
  'team-success': {
    comment: "Team achievement feels warm! Sharing success doubles the joy."
  },
  'hate-job': {
    comment: "Hate your job? This is common! This strong emotion indicates you need to find a career direction that suits you better. Think about what can make you feel excited and valuable."
  },
  'dislike-job': {
    comment: "Don't like your job? This suggests you might need some changes. Think about what can make you more satisfied, or find more meaning in your current work."
  },
  'neutral-job': {
    comment: "Work is just work, that's okay! The important thing is finding other balance points in life. Many people are like this, the key is finding joy outside of work."
  },
  'like-job': {
    comment: "Liking your job is great! This satisfaction makes work enjoyable. Keep this positive attitude, and you'll do well."
  },
  'love-job': {
    comment: "Loving your job is the best state! This passion can bring excellent performance. You're lucky to have found a career you love!"
  },
  'poor-balance': {
    comment: "Poor work-life balance? This is common! Start improving from small things, like setting work boundaries or scheduling more personal time."
  },
  'needs-improvement': {
    comment: "Balance needs constant adjustment! Find a rhythm that suits you. Try some time management techniques or re-evaluate your priorities."
  },
  'neutral-balance': {
    comment: "Average balance? This is normal! Many people are trying to find balance. Keep exploring what's most important to you."
  },
  'good-balance': {
    comment: "Good balance is a sign of healthy living! Keep maintaining this state. You've found a rhythm that suits you."
  },
  'excellent-balance': {
    comment: "Excellent balance is enviable! This harmonious state is worth learning from. You've mastered the art of work-life balance!"
  },
  'very-stressed': {
    comment: "Heavy financial pressure? This is common! Consider starting improvements from small things, like creating a budget or seeking financial advice."
  },
  'stressed': {
    comment: "Some financial pressure? This is normal! Start improving financial management from small things, like tracking expenses or finding additional income sources."
  },
  'neutral-finances': {
    comment: "Average financial situation? This is common! Many people are working to improve their financial situation. Make a plan and start small."
  },
  'comfortable': {
    comment: "Financial stability is a great achievement! Keep maintaining this state. You've found a financial management approach that suits you."
  },
  'very-comfortable': {
    comment: "Financial comfort brings peace of mind! This sense of security is the foundation of quality of life. You've mastered the art of financial management!"
  },
  'strongly-independent': {
    comment: "Strong preference for independent work? This shows you have strong focus and self-drive. This ability is especially valuable in tasks requiring deep thinking."
  },
  'prefer-independent': {
    comment: "Prefer independent work? This is normal! Some people indeed perform better when working alone. Finding a work style that suits you is important."
  },
  'neutral-preference': {
    comment: "No strong preference? This is flexible! Being able to adjust work styles according to tasks and situations is the wisest choice."
  },
  'prefer-collaborative': {
    comment: "Prefer collaborative work? This shows you're good at teamwork. Collaboration can bring better results and more creativity."
  },
  'strongly-collaborative': {
    comment: "Strong preference for collaborative work? This shows you really enjoy teamwork. Collaboration can bring energy, creativity, and better results!"
  }
};

// 获取AI朋友评论
export const getAIFriendComment = (questionId: string, optionId: string): string => {
  const questionComments = aiFriendComments[optionId];
  return questionComments?.comment || "This choice is interesting! Everyone has their own story and preferences, making the world so diverse.";
};
