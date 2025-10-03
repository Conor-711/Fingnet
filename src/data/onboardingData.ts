import { OnboardingQuestion } from '@/types/post';

// Onboarding问题数据 - 5个问题
export const onboardingQuestions: OnboardingQuestion[] = [
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
          src: '/cele/steve_jobs.png',
          alt: 'Steve Jobs',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'richard-branson',
        label: 'Richard Branson',
        value: 'richard-branson',
        avatar: {
          src: '/cele/rechard.png',
          alt: 'Richard Branson',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'lebron-james',
        label: 'LeBron James',
        value: 'lebron-james',
        avatar: {
          src: '/cele/lebron.png',
          alt: 'LeBron James',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'oprah-winfrey',
        label: 'Oprah Winfrey',
        value: 'oprah-winfrey',
        avatar: {
          src: '/cele/Oprah.png',
          alt: 'Oprah Winfrey',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'emma-watson',
        label: 'Emma Watson',
        value: 'emma-watson',
        avatar: {
          src: '/cele/emma.png',
          alt: 'Emma Watson',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'serena-williams',
        label: 'Serena Williams',
        value: 'serena-williams',
        avatar: {
          src: '/cele/serena.png',
          alt: 'Serena Williams',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'jeff-bezos',
        label: 'Jeff Bezos',
        value: 'jeff-bezos',
        avatar: {
          src: '/cele/jeff.png',
          alt: 'Jeff Bezos',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'kevin-hart',
        label: 'Kevin Hart',
        value: 'kevin-hart',
        avatar: {
          src: '/cele/kevin.png',
          alt: 'Kevin Hart',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'brene-brown',
        label: 'Brené Brown',
        value: 'brene-brown',
        avatar: {
          src: '/cele/brown.png',
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
          src: '/tools/notion.png',
          alt: 'Notion',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'figma',
        label: 'Figma',
        value: 'figma',
        avatar: {
          src: '/tools/figma.png',
          alt: 'Figma',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'cursor',
        label: 'Cursor',
        value: 'cursor',
        avatar: {
          src: '/tools/cursor.png',
          alt: 'Cursor',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'canva',
        label: 'Canva',
        value: 'canva',
        avatar: {
          src: '/tools/canva.png',
          alt: 'Canva',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'manus',
        label: 'Manus',
        value: 'manus',
        avatar: {
          src: '/tools/manus.png',
          alt: 'Manus',
          bgColor: 'bg-white'
        }
      },
      {
        id: 'nano',
        label: 'Nano',
        value: 'nano',
        avatar: {
          src: '/tools/nano.png',
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
  'areas-to-elevate': {
    emotions: 'Understanding emotions is the key to meaningful connections.',
    motivation: 'Staying motivated helps you achieve what matters most.',
    nutrition: 'Fueling your body right powers everything else.',
    habits: 'Small daily habits create lasting transformation.',
    confidence: 'Confidence opens doors you didn\'t know existed.',
    mindset: 'Your mindset shapes your reality.',
    'self-care': 'Taking care of yourself isn\'t selfish—it\'s essential.',
    exercise: 'Movement is medicine for mind and body.',
    empathy: 'Empathy builds bridges where walls once stood.',
    'love-relationships': 'Strong relationships are built on trust and communication.',
    'personal-finance': 'Financial wellness brings peace of mind.',
    creativity: 'Creativity is intelligence having fun.'
  },
  'inspiration': {
    'steve-jobs': 'Innovation distinguishes between a leader and a follower.',
    'richard-branson': 'Entrepreneurship is living a few years of your life like most people won\'t...',
    'lebron-james': 'Excellence requires dedication, discipline, and sacrifice.',
    'oprah-winfrey': 'Turn your wounds into wisdom.',
    'emma-watson': 'Use your voice to make a difference in the world.',
    'serena-williams': 'Champions keep playing until they get it right.',
    'jeff-bezos': 'We are what we choose.',
    'kevin-hart': 'Life is too short to worry about what others say or think.',
    'brene-brown': 'Vulnerability is the birthplace of innovation, creativity and change.'
  },
  'thinking-style': {
    'big-picture': 'Visionaries see possibilities others miss.',
    'detail-oriented': 'Excellence is in the details.',
    'balanced': 'Balance brings the best of both worlds.'
  },
  'personality-type': {
    leader: 'Leaders inspire others to be their best selves.',
    follower: 'Great teams need both leaders and skilled collaborators.',
    both: 'Adaptability is a superpower in today\'s world.'
  },
  'daily-tools': {
    notion: 'Organize your thoughts, organize your life.',
    figma: 'Design is thinking made visual.',
    cursor: 'The right tools amplify your capabilities.',
    canva: 'Creativity made simple.',
    manus: 'Efficiency is doing things right.',
    nano: 'Simplicity is the ultimate sophistication.'
  }
};

// 根据问题ID和选项ID获取AI朋友评论
export const getAIFriendComment = (questionId: string, optionId: string): string => {
  return aiFriendComments[questionId]?.[optionId] || 'Great choice! This will help shape your journey.';
};
