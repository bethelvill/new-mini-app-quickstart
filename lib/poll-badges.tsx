import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, XCircle } from 'lucide-react';
import { POLL_CATEGORIES } from '@/constants/categories';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className='text-emerald-400 border border-emerald-500/30'>
          <span className='relative flex h-2 w-2 mr-1.5'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-400'></span>
          </span>
          Live
        </Badge>
      );
    case 'closed':
      return (
        <Badge className=' text-amber-400 border border-amber-500/30'>
          <Clock className='w-3 h-3 mr-1' />
          Closed
        </Badge>
      );
    case 'resolved':
      return (
        <Badge className='bg-amber-500/10 text-amber-400 border border-amber-500/30'>
          <Trophy className='w-3 h-3 mr-1' />
          Winner Declared
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className='bg-gray-500/20 text-gray-400 border border-gray-500/30'>
          <XCircle className='w-3 h-3 mr-1' />
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

export const getCategoryBadge = (category: string) => {
  // Find category from POLL_CATEGORIES
  const cat = POLL_CATEGORIES.find((c) => c.value === category);
  if (!cat) return null;

  return (
    <Badge className='bg-transparent text-[#9A9A9A] border border-[#1F1F1F] text-xs font-normal'>
      {cat.label}
    </Badge>
  );
};