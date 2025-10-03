import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { type Invitation } from '@/lib/supabase';

interface InvitationsPageProps {
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
  isLoadingInvitations: boolean;
  onAcceptInvitation: (invitation: Invitation) => Promise<void>;
  onDeclineInvitation: (invitationId: string) => Promise<void>;
}

export default function InvitationsPage({
  sentInvitations,
  receivedInvitations,
  isLoadingInvitations,
  onAcceptInvitation,
  onDeclineInvitation
}: InvitationsPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-700">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoadingInvitations) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Loading invitations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Invitations</h2>
        <p className="text-gray-600">Manage your connection invitations</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - Invitation Received */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span>Received</span>
              <Badge className="bg-white/20 text-white">
                {receivedInvitations.filter(inv => inv.status === 'pending').length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {receivedInvitations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No invitations received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invitation.sender_id}`} />
                          <AvatarFallback>👤</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            User {invitation.sender_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(invitation.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>

                    {invitation.message && (
                      <p className="text-sm text-gray-700 mb-3 italic">
                        "{invitation.message}"
                      </p>
                    )}

                    {invitation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onAcceptInvitation(invitation)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeclineInvitation(invitation.id)}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {invitation.status === 'accepted' && invitation.accepted_at && (
                      <p className="text-xs text-green-600 font-medium">
                        Accepted on {formatDate(invitation.accepted_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side - Invitation Sent */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span>Sent</span>
              <Badge className="bg-white/20 text-white">
                {sentInvitations.filter(inv => inv.status === 'pending').length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {sentInvitations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No invitations sent yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Visit Connections page to send invitations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invitation.recipient_id}`} />
                          <AvatarFallback>👤</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            User {invitation.recipient_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            Sent {formatDate(invitation.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>

                    {invitation.message && (
                      <p className="text-sm text-gray-700 mb-2 italic">
                        Your message: "{invitation.message}"
                      </p>
                    )}

                    {invitation.status === 'accepted' && invitation.accepted_at && (
                      <div className="flex items-center text-green-600 text-sm font-medium mt-2">
                        <Check className="w-4 h-4 mr-1" />
                        Accepted on {formatDate(invitation.accepted_at)}
                      </div>
                    )}

                    {invitation.status === 'declined' && (
                      <div className="flex items-center text-red-600 text-sm font-medium mt-2">
                        <X className="w-4 h-4 mr-1" />
                        Declined
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

