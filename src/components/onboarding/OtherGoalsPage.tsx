import { Card, CardContent } from '@/components/ui/card';

interface OtherGoalsPageProps {
  onBack: () => void;
  onContinue: () => void;
}

const mockSimilarUsers = [
  {
    id: 1,
    name: "Alex Thompson",
    avatar: "👨‍💻",
    goal: "I want to transition from backend development to machine learning and land a role at a tech company within the next year.",
    similarity: 95,
    background: "Software Engineer, 3 years experience"
  },
  {
    id: 2,
    name: "Sarah Chen",
    avatar: "👩‍🔬",
    goal: "Looking to build my own SaaS product while maintaining my current job, focusing on productivity tools for remote teams.",
    similarity: 92,
    background: "Product Manager, 5 years experience"
  },
  {
    id: 3,
    name: "Marcus Williams",
    avatar: "👨‍🎨",
    goal: "Want to combine my design skills with coding to become a full-stack developer and work on meaningful projects that impact society.",
    similarity: 88,
    background: "UI/UX Designer, 4 years experience"
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    avatar: "👩‍💼",
    goal: "Planning to start my own consulting business in digital marketing while building a personal brand through content creation.",
    similarity: 85,
    background: "Marketing Specialist, 6 years experience"
  },
  {
    id: 5,
    name: "David Kim",
    avatar: "👨‍🏫",
    goal: "Transitioning from traditional education to EdTech, wanting to create online courses and educational platforms for underserved communities.",
    similarity: 82,
    background: "High School Teacher, 8 years experience"
  }
];

export default function OtherGoalsPage({ onBack, onContinue }: OtherGoalsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 py-8">
      <div className="w-full max-w-4xl mx-4 md:mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            People Similar to You
          </h1>
          <p className="text-lg text-gray-600">
            Here are goals from users with similar profiles and interests as yours
          </p>
        </div>

        {/* Similar Users Goals */}
        <div className="space-y-6">
          {mockSimilarUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">
                    {user.avatar}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <span className="text-sm text-indigo-600 font-medium">{user.similarity}% similar</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{user.background}</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{user.goal}"
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
          >
            Back to My Goal
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            I'm Inspired - Let's Start!
          </button>
        </div>
      </div>
    </div>
  );
}

