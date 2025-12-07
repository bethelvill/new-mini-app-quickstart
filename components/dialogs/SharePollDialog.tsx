'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import html2canvas from 'html2canvas';
import {
  Check,
  Copy,
  Download,
  Loader2,
  Share2,
} from 'lucide-react';
import numeral from 'numeral';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface SharePollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  poll: any;
}

export default function SharePollDialog({
  isOpen,
  onClose,
  poll,
}: SharePollDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const pollCardRef = useRef<HTMLDivElement>(null);

  const pollUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/polls/${poll.id}`
      : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setIsCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setIsCopied(false), 2000);

      import('@/lib/analytics').then(({ trackPollShared }) => {
        trackPollShared(poll.id, 'link');
      });
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCaptureAndDownload = async () => {
    if (!pollCardRef.current) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(pollCardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        removeContainer: false,
      });

      const croppedCanvas = document.createElement('canvas');
      const ctx = croppedCanvas.getContext('2d');
      croppedCanvas.width = canvas.width;
      croppedCanvas.height = canvas.height;
      ctx?.drawImage(canvas, 0, 0);

      const image = croppedCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `poll-${poll.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Error capturing poll card:', error);
      toast.error('Failed to download image');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleNativeShare = async () => {
    const text = `${poll.title}\n\n${pollUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        import('@/lib/analytics').then(({ trackPollShared }) => {
          trackPollShared(poll.id, 'native');
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  const totalAmount = poll.statistics?.totalAmount || poll.totalStakeAmount || 0;
  const totalParticipants = poll.statistics?.totalParticipants || poll.totalParticipants || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return numeral(num).format('0.0a').toUpperCase();
    if (num >= 1000) return numeral(num).format('0.0a');
    return numeral(num).format('0,0.00');
  };

  // Get sorted options with percentages
  const sortedOptions = poll.options
    ?.map((option: any) => {
      const optionStat = poll.statistics?.options?.find((o: any) => o.id === option.id);
      return {
        ...option,
        percentage: optionStat?.percentage || 0,
      };
    })
    .sort((a: any, b: any) => b.percentage - a.percentage)
    .slice(0, 3) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-[#EDEDED] max-w-sm p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="text-lg font-semibold text-[#EDEDED]">
            Share Poll
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          {/* Hidden Poll Card for Capture */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div
              ref={pollCardRef}
              style={{
                width: '480px',
                background: '#000000',
                borderRadius: '20px',
                padding: '32px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Logo */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                  src="https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg"
                  alt="Logo"
                  style={{ width: '40px', height: '40px', margin: '0 auto' }}
                />
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#EDEDED',
                  textAlign: 'center',
                  marginBottom: '24px',
                  lineHeight: '1.3',
                }}
              >
                {poll.title}
              </div>

              {/* Stats Row */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: '#0A0A0A',
                    border: '1px solid #1F1F1F',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#9A9A9A', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                    POOL
                  </div>
                  <div style={{ color: '#EDEDED', fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <img src="/usdc.svg" alt="USDC" style={{ width: '18px', height: '18px' }} />
                    {formatNumber(totalAmount)}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#0A0A0A',
                    border: '1px solid #1F1F1F',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#9A9A9A', fontSize: '11px', marginBottom: '6px', fontWeight: '500' }}>
                    PLAYERS
                  </div>
                  <div style={{ color: '#EDEDED', fontSize: '20px', fontWeight: '600' }}>
                    {totalParticipants}
                  </div>
                </div>
              </div>

              {/* Options */}
              {sortedOptions.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  {sortedOptions.map((option: any, index: number) => (
                    <div
                      key={option.id}
                      style={{
                        background: '#0A0A0A',
                        border: '1px solid #1F1F1F',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#9A9A9A', fontSize: '12px' }}>#{index + 1}</span>
                        <span style={{ color: '#EDEDED', fontSize: '14px' }}>{option.text}</span>
                      </div>
                      <span style={{ color: '#22D3D3', fontSize: '14px', fontWeight: '600' }}>
                        {option.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                  {poll.options.length > 3 && (
                    <div style={{ textAlign: 'center', color: '#9A9A9A', fontSize: '12px', marginTop: '4px' }}>
                      +{poll.options.length - 3} more
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  borderTop: '1px solid #1F1F1F',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#9A9A9A', fontSize: '12px' }}>showstakr.com</span>
                <span style={{ color: '#9A9A9A', fontSize: '12px' }}>Predict & Win</span>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-4 rounded-xl bg-[#151515] border border-[#1F1F1F]">
            <p className="text-sm text-[#EDEDED] font-medium line-clamp-2 mb-3">
              {poll.title}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#9A9A9A]">
              <span className="inline-flex items-center gap-1">
                <Image src="/usdc.svg" alt="USDC" width={12} height={12} />
                {formatNumber(totalAmount)}
              </span>
              <span>{totalParticipants} players</span>
            </div>
          </div>

          {/* URL Copy */}
          <div className="flex gap-2">
            <Input
              value={pollUrl}
              readOnly
              className="h-10 bg-[#151515] border-[#1F1F1F] text-[#9A9A9A] text-sm rounded-xl"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="h-10 px-3 border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] rounded-xl"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleNativeShare}
              className="flex-1 h-11 bg-[#EDEDED] hover:bg-[#D8D8D8] text-[#0A0A0A] font-medium rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleCaptureAndDownload}
              disabled={isCapturing}
              variant="outline"
              className="h-11 px-4 border-[#1F1F1F] text-[#D8D8D8] hover:bg-[#151515] rounded-xl"
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
