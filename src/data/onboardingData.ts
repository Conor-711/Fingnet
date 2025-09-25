import { OnboardingQuestion } from '@/types/post';

// Onboarding问题数据
export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'age',
    type: 'single-choice',
    title: 'Become the most interesting person in the room',
    subtitle: '3-MINUTE QUIZ',
    required: true,
    options: [
      {
        id: 'age-18-24',
        label: 'Age: 18-24',
        value: '18-24',
        avatar: {
          src: '🎓', // 使用emoji作为头像替代
          alt: 'Student',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'age-25-34',
        label: 'Age: 25-34',
        value: '25-34',
        avatar: {
          src: '☕',
          alt: 'Coffee',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'age-35-44',
        label: 'Age: 35-44',
        value: '35-44',
        avatar: {
          src: '😎',
          alt: 'Sunglasses',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'age-45-plus',
        label: 'Age: 45+',
        value: '45+',
        avatar: {
          src: '🧢',
          alt: 'Beanie',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'gender',
    type: 'single-choice',
    title: 'What\'s your gender?',
    required: true,
    options: [
      {
        id: 'gender-female',
        label: 'Female',
        value: 'female',
        avatar: {
          src: '👩',
          alt: 'Female',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'gender-male',
        label: 'Male',
        value: 'male',
        avatar: {
          src: '👨',
          alt: 'Male',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'gender-other',
        label: 'Other',
        value: 'other',
        avatar: {
          src: '🌈',
          alt: 'Other',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'gender-prefer-not-say',
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
    id: 'relationship-status',
    type: 'single-choice',
    title: 'What\'s your relationship status?',
    required: true,
    options: [
      {
        id: 'single',
        label: 'Single',
        value: 'single',
        avatar: {
          src: '💕',
          alt: 'Single',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'in-relationship',
        label: 'In a relationship',
        value: 'in-relationship',
        avatar: {
          src: '💑',
          alt: 'In relationship',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'married',
        label: 'Married',
        value: 'married',
        avatar: {
          src: '💍',
          alt: 'Married',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'complicated',
        label: 'It\'s complicated',
        value: 'complicated',
        avatar: {
          src: '🤔',
          alt: 'Complicated',
          bgColor: 'bg-orange-100'
        }
      }
    ]
  },
  {
    id: 'interests',
    type: 'multiple-choice',
    title: 'What are your main interests?',
    subtitle: 'Select all that apply',
    required: true,
    options: [
      {
        id: 'tech',
        label: 'Technology',
        value: 'tech',
        avatar: {
          src: '💻',
          alt: 'Tech',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'travel',
        label: 'Travel',
        value: 'travel',
        avatar: {
          src: '✈️',
          alt: 'Travel',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'food',
        label: 'Food & Cooking',
        value: 'food',
        avatar: {
          src: '🍳',
          alt: 'Food',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'fitness',
        label: 'Fitness & Health',
        value: 'fitness',
        avatar: {
          src: '🏃',
          alt: 'Fitness',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'gaming',
        label: 'Gaming',
        value: 'gaming',
        avatar: {
          src: '🎮',
          alt: 'Gaming',
          bgColor: 'bg-indigo-100'
        }
      },
      {
        id: 'reading',
        label: 'Reading',
        value: 'reading',
        avatar: {
          src: '📚',
          alt: 'Reading',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'music',
        label: 'Music',
        value: 'music',
        avatar: {
          src: '🎵',
          alt: 'Music',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'movies',
        label: 'Movies & TV',
        value: 'movies',
        avatar: {
          src: '🎬',
          alt: 'Movies',
          bgColor: 'bg-red-100'
        }
      }
    ]
  },
  {
    id: 'communication-style',
    type: 'single-choice',
    title: 'How would you describe your communication style?',
    required: true,
    options: [
      {
        id: 'direct',
        label: 'Direct & straightforward',
        value: 'direct',
        avatar: {
          src: '📈',
          alt: 'Direct',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'expressive',
        label: 'Expressive & emotional',
        value: 'expressive',
        avatar: {
          src: '🎨',
          alt: 'Expressive',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'analytical',
        label: 'Analytical & thoughtful',
        value: 'analytical',
        avatar: {
          src: '🧠',
          alt: 'Analytical',
          bgColor: 'bg-purple-100'
        }
      },
      {
        id: 'casual',
        label: 'Casual & relaxed',
        value: 'casual',
        avatar: {
          src: '😎',
          alt: 'Casual',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'social-preference',
    type: 'single-choice',
    title: 'How social are you?',
    required: true,
    options: [
      {
        id: 'introvert',
        label: 'Introvert - prefer small groups',
        value: 'introvert',
        avatar: {
          src: '🏠',
          alt: 'Introvert',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'extrovert',
        label: 'Extrovert - love meeting people',
        value: 'extrovert',
        avatar: {
          src: '🎉',
          alt: 'Extrovert',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'ambivert',
        label: 'Ambivert - balanced',
        value: 'ambivert',
        avatar: {
          src: '⚖️',
          alt: 'Ambivert',
          bgColor: 'bg-green-100'
        }
      }
    ]
  },
  {
    id: 'humor-style',
    type: 'multiple-choice',
    title: 'What\'s your sense of humor?',
    subtitle: 'Select all that apply',
    required: false,
    options: [
      {
        id: 'sarcastic',
        label: 'Sarcastic & witty',
        value: 'sarcastic',
        avatar: {
          src: '😏',
          alt: 'Sarcastic',
          bgColor: 'bg-orange-100'
        }
      },
      {
        id: 'dark',
        label: 'Dark & twisted',
        value: 'dark',
        avatar: {
          src: '🖤',
          alt: 'Dark humor',
          bgColor: 'bg-gray-100'
        }
      },
      {
        id: 'punny',
        label: 'Punny & wordplay',
        value: 'punny',
        avatar: {
          src: '🤪',
          alt: 'Punny',
          bgColor: 'bg-yellow-100'
        }
      },
      {
        id: 'observational',
        label: 'Observational',
        value: 'observational',
        avatar: {
          src: '👀',
          alt: 'Observational',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'self-deprecating',
        label: 'Self-deprecating',
        value: 'self-deprecating',
        avatar: {
          src: '🤦',
          alt: 'Self-deprecating',
          bgColor: 'bg-purple-100'
        }
      }
    ]
  },
  {
    id: 'dating-goals',
    type: 'multiple-choice',
    title: 'What are you looking for?',
    subtitle: 'Select all that apply',
    required: false,
    options: [
      {
        id: 'casual-dating',
        label: 'Casual dating',
        value: 'casual-dating',
        avatar: {
          src: '☕',
          alt: 'Casual dating',
          bgColor: 'bg-pink-100'
        }
      },
      {
        id: 'serious-relationship',
        label: 'Serious relationship',
        value: 'serious-relationship',
        avatar: {
          src: '💍',
          alt: 'Serious relationship',
          bgColor: 'bg-red-100'
        }
      },
      {
        id: 'friendship',
        label: 'Friendship',
        value: 'friendship',
        avatar: {
          src: '👫',
          alt: 'Friendship',
          bgColor: 'bg-green-100'
        }
      },
      {
        id: 'networking',
        label: 'Networking',
        value: 'networking',
        avatar: {
          src: '🤝',
          alt: 'Networking',
          bgColor: 'bg-blue-100'
        }
      },
      {
        id: 'just-fun',
        label: 'Just for fun',
        value: 'just-fun',
        avatar: {
          src: '🎭',
          alt: 'Just for fun',
          bgColor: 'bg-purple-100'
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
