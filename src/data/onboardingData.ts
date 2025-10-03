import { OnboardingQuestion } from '@/types/post';

// Onboarding问题数据 - 5个问题
export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'hobbies-interests',
    type: 'multiple-choice',
    title: 'What are your hobbies or interests?',
    subtitle: 'Select all that apply',
    required: true,
    options: [
      {
        id: 'reading',
        label: 'Reading',
        value: 'reading',
        avatar: {
          src: '📚',
          alt: 'Reading',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'sports',
        label: 'Sports',
        value: 'sports',
        avatar: {
          src: '⚽',
          alt: 'Sports',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'music',
        label: 'Music',
        value: 'music',
        avatar: {
          src: '🎵',
          alt: 'Music',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'travel',
        label: 'Travel',
        value: 'travel',
        avatar: {
          src: '✈️',
          alt: 'Travel',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'cooking',
        label: 'Cooking',
        value: 'cooking',
        avatar: {
          src: '🍳',
          alt: 'Cooking',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'art',
        label: 'Art & Design',
        value: 'art',
        avatar: {
          src: '🎨',
          alt: 'Art',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'tech',
        label: 'Technology',
        value: 'tech',
        avatar: {
          src: '💻',
          alt: 'Technology',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'photography',
        label: 'Photography',
        value: 'photography',
        avatar: {
          src: '📷',
          alt: 'Photography',
          bgColor: 'bg-teal-100'
        }
      },
      {
        id: 'gaming',
        label: 'Gaming',
        value: 'gaming',
        avatar: {
          src: '🎮',
          alt: 'Gaming',
          bgColor: 'bg-cyan-100'
        }
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
    id: 'resonating-quotes',
    type: 'multiple-choice',
    title: 'Which quotes resonate with you the most?',
    subtitle: 'Select all that apply',
    required: false,
    options: [
      {
        id: 'quote-innovation',
        label: 'Innovation distinguishes between a leader and a follower',
        value: 'quote-innovation',
        avatar: {
          src: '💡',
          alt: 'Innovation',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'quote-change',
        label: 'Be the change you wish to see in the world',
        value: 'quote-change',
        avatar: {
          src: '🌍',
          alt: 'Change',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'quote-imagination',
        label: 'Logic will get you from A to B. Imagination will take you everywhere',
        value: 'quote-imagination',
        avatar: {
          src: '✨',
          alt: 'Imagination',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'quote-success',
        label: 'Success is not final, failure is not fatal',
        value: 'quote-success',
        avatar: {
          src: '🎯',
          alt: 'Success',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'quote-action',
        label: 'The way to get started is to quit talking and begin doing',
        value: 'quote-action',
        avatar: {
          src: '🚀',
          alt: 'Action',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'quote-opportunity',
        label: 'In the middle of difficulty lies opportunity',
        value: 'quote-opportunity',
        avatar: {
          src: '🌟',
          alt: 'Opportunity',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'quote-passion',
        label: 'The only way to do great work is to love what you do',
        value: 'quote-passion',
        avatar: {
          src: '❤️',
          alt: 'Passion',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'quote-future',
        label: 'The best way to predict the future is to create it',
        value: 'quote-future',
        avatar: {
          src: '🔮',
          alt: 'Future',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'quote-limits',
        label: 'The only limits are the ones we set for ourselves',
        value: 'quote-limits',
        avatar: {
          src: '🦅',
          alt: 'Limits',
          bgColor: 'bg-teal-100'
        }
      }
    ]
  },
  {
    id: 'interesting-users',
    type: 'multiple-choice',
    title: 'Which type of people do you find most interesting?',
    subtitle: 'Select all that apply',
    required: false,
    options: [
      {
        id: 'entrepreneurs',
        label: 'Entrepreneurs',
        value: 'entrepreneurs',
        avatar: {
          src: '💼',
          alt: 'Entrepreneurs',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'artists',
        label: 'Artists & Creators',
        value: 'artists',
        avatar: {
          src: '🎨',
          alt: 'Artists',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'athletes',
        label: 'Athletes',
        value: 'athletes',
        avatar: {
          src: '🏆',
          alt: 'Athletes',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'scientists',
        label: 'Scientists & Researchers',
        value: 'scientists',
        avatar: {
          src: '🔬',
          alt: 'Scientists',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'educators',
        label: 'Educators & Mentors',
        value: 'educators',
        avatar: {
          src: '👨‍🏫',
          alt: 'Educators',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'activists',
        label: 'Activists & Change-makers',
        value: 'activists',
        avatar: {
          src: '✊',
          alt: 'Activists',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'technologists',
        label: 'Tech Innovators',
        value: 'technologists',
        avatar: {
          src: '💻',
          alt: 'Technologists',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'adventurers',
        label: 'Adventurers & Explorers',
        value: 'adventurers',
        avatar: {
          src: '🧭',
          alt: 'Adventurers',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'storytellers',
        label: 'Storytellers & Writers',
        value: 'storytellers',
        avatar: {
          src: '📖',
          alt: 'Storytellers',
          bgColor: 'bg-teal-100'
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
  'hobbies-interests': {
    reading: 'Reading opens doors to endless worlds and perspectives.',
    sports: 'Physical activity energizes both body and mind.',
    music: 'Music speaks what words cannot express.',
    travel: 'Travel is the only thing you buy that makes you richer.',
    cooking: 'Cooking is love made visible.',
    art: 'Art enables us to find ourselves and lose ourselves at the same time.',
    tech: 'Technology is best when it brings people together.',
    photography: 'Photography is the story I fail to put into words.',
    gaming: 'Gaming teaches problem-solving and strategic thinking.'
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
  'resonating-quotes': {
    'quote-innovation': 'Innovation is the key to staying ahead.',
    'quote-change': 'Be the change you want to see.',
    'quote-imagination': 'Imagination knows no bounds.',
    'quote-success': 'Resilience defines true success.',
    'quote-action': 'Action turns dreams into reality.',
    'quote-opportunity': 'Every challenge is an opportunity in disguise.',
    'quote-passion': 'Passion fuels excellence.',
    'quote-future': 'Create the future you want to live in.',
    'quote-limits': 'Your potential is limitless.'
  },
  'interesting-users': {
    entrepreneurs: 'Entrepreneurs turn ideas into impact.',
    artists: 'Artists see the world through a unique lens.',
    athletes: 'Athletes exemplify dedication and discipline.',
    scientists: 'Scientists unlock the mysteries of our world.',
    educators: 'Educators shape the minds of tomorrow.',
    activists: 'Activists drive meaningful change.',
    technologists: 'Tech innovators build the future.',
    adventurers: 'Adventurers embrace the unknown.',
    storytellers: 'Storytellers connect us through shared experiences.'
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
