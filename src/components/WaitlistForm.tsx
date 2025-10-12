import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { submitToWaitlist, checkEmailInWaitlist } from '@/lib/supabase';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // 先检查是否已存在
      const { data: existing } = await checkEmailInWaitlist(email);
      
      if (existing) {
        toast.info('You are already on the waitlist!');
        setIsSubmitted(true);
        setIsSubmitting(false);
        return;
      }

      // 提交到 waitlist
      const { error } = await submitToWaitlist(email);

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already on the waitlist!');
          setIsSubmitted(true);
        } else {
          console.error('Waitlist submission error:', error);
          toast.error('Failed to join waitlist. Please try again.');
        }
      } else {
        toast.success('Successfully joined the waitlist!');
        setIsSubmitted(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">You're on the list!</h3>
        <p className="text-gray-600 text-center max-w-md">
          We'll notify you when we're ready to welcome you to Fingnet.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSubmitted(false)}
          className="mt-4"
        >
          Join with another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            'Join Waitlist'
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Join our waitlist to get early access when we launch.
      </p>
    </form>
  );
}

