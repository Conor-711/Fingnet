interface BasicInfo {
  avatar: string;
  nickname: string;
  ageRange: string;
  gender: string;
  occupation: string;
  industry: string;
  location: string;
}

interface BasicInfoPageProps {
  basicInfo: BasicInfo;
  overallProgress: number;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export default function BasicInfoPage({
  basicInfo,
  overallProgress,
  onChange,
  onSubmit
}: BasicInfoPageProps) {
  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange('avatar', e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    // 验证必填字段
    if (!basicInfo.avatar || !basicInfo.nickname || !basicInfo.ageRange || 
        !basicInfo.gender || !basicInfo.occupation || !basicInfo.industry || 
        !basicInfo.location) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
      {/* 进度条 */}
      <div className="w-full bg-white/80 backdrop-blur-sm shadow-sm z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 1 of 3: Basic Info</span>
            <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl mx-4 relative z-10">
          <div className="backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="relative px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Tell Us About Yourself
                </h1>
                <p className="text-gray-600">
                  Help us personalize your experience with some basic information
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-6">
              {/* Avatar & Nickname Row */}
              <div className="flex items-start space-x-6 pb-6 border-b border-gray-200/50">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <label className="text-sm font-semibold text-gray-700 block mb-3">
                    Your Avatar <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform border-4 border-white overflow-hidden"
                    onClick={handleAvatarUpload}
                  >
                    {basicInfo.avatar ? (
                      <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-center">
                        <div className="text-3xl mb-1">📷</div>
                        <div className="text-xs">Upload</div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Click to upload</p>
                </div>

                {/* Nickname */}
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                    Your Nickname <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfo.nickname}
                    onChange={(e) => onChange('nickname', e.target.value)}
                    placeholder="How should we call you?"
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-2">This will be used throughout your journey</p>
                </div>
              </div>

              {/* Age Range & Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Age Range <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={basicInfo.ageRange}
                    onChange={(e) => onChange('ageRange', e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select age range</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    Gender <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={basicInfo.gender}
                    onChange={(e) => onChange('gender', e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  Occupation <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.occupation}
                  onChange={(e) => onChange('occupation', e.target.value)}
                  placeholder="e.g., Software Engineer, Designer, Student..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  Industry <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={basicInfo.industry}
                  onChange={(e) => onChange('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select your industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  Location <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.location}
                  onChange={(e) => onChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Continue to Goal Setting</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

