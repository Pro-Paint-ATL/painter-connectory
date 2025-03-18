
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileSignature } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DepositAgreementFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  bookingId?: string;
  projectType: string;
  customerName: string;
  painterName: string;
  bookingDate: string;
}

const DepositAgreementForm = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  bookingId,
  projectType,
  customerName,
  painterName,
  bookingDate
}: DepositAgreementFormProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerSignature, setCustomerSignature] = useState('');
  const [customerAgreed, setCustomerAgreed] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Calculate deposit amount (20% of total)
  const depositAmount = Math.round(amount * 0.2 * 100) / 100;
  
  const isOneDay = projectType === "Color Consultation" || 
                   projectType === "Other" || 
                   amount < 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerSignature) {
      setSubmissionError("Please provide your digital signature to continue.");
      toast({
        title: "Signature Required",
        description: "Please sign the agreement to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!customerAgreed) {
      setSubmissionError("You must agree to the terms to continue.");
      toast({
        title: "Agreement Required",
        description: "You must agree to the terms to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingId) {
      setSubmissionError("Booking reference is missing. Please try again or contact support.");
      toast({
        title: "Submission Failed",
        description: "Booking reference is missing. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSubmissionError(null);

    try {
      // Store the agreement in the database
      await supabase
        .from('booking_agreements')
        .insert({
          booking_id: bookingId,
          customer_signature: customerSignature,
          agreement_text: getAgreementText(),
          customer_agreed: customerAgreed,
          agreement_date: new Date().toISOString(),
          status: 'customer_signed'
        });
        
      // Update booking status
      await supabase
        .from('bookings')
        .update({ 
          status: 'agreement_signed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
            
      toast({
        title: "Agreement Signed",
        description: "Your agreement has been submitted successfully.",
      });
      
      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error('Error submitting agreement:', error);
      setSubmissionError('An unexpected error occurred. Please try again.');
      toast({
        title: "Submission Error",
        description: 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getAgreementText = () => {
    const paymentTerms = isOneDay 
      ? `PAYMENT TERMS: Customer agrees to pay the full amount of $${amount.toFixed(2)} at the completion of the work on ${bookingDate}.`
      : `PAYMENT TERMS: Customer agrees to pay a good-faith deposit of $${depositAmount.toFixed(2)} (20% of the total estimated cost) at the completion of the first day of work. The remaining balance of $${(amount - depositAmount).toFixed(2)} shall be paid within one (1) business day after the completion of the project.`;

    return `
GOOD FAITH AGREEMENT BETWEEN CUSTOMER AND PAINTER

Project Type: ${projectType}
Total Estimated Amount: $${amount.toFixed(2)}
Booking Date: ${bookingDate}

This Agreement is entered into by and between ${customerName} ("Customer") and ${painterName} ("Painter") on ${new Date().toLocaleDateString()}.

1. SCOPE OF WORK: Painter agrees to provide painting services as outlined in the booking details for the project type specified above.

2. ${paymentTerms}

3. CANCELLATION: If the Customer cancels the project less than 48 hours before the scheduled start date without reasonable cause, the Painter reserves the right to charge a cancellation fee of up to 10% of the total estimated cost.

4. PAINTER OBLIGATIONS: Painter agrees to arrive promptly on the scheduled date, perform the work in a professional manner, and complete the project within a reasonable timeframe.

5. CUSTOMER OBLIGATIONS: Customer agrees to provide access to the premises, ensure the work area is reasonably clear, and communicate any specific requirements before work begins.

6. CHANGES TO WORK: Any changes to the scope of work may result in price adjustments. Such changes must be agreed upon in writing by both parties.

7. DISPUTE RESOLUTION: In the event of a dispute, both parties agree to attempt resolution through good faith negotiation before pursuing legal action.

8. LIABILITY LIMITATION: ProPaint serves solely as a platform connecting customers with painters and is not responsible for the quality of work, damages, or disputes arising between Customer and Painter. ProPaint is not a party to this agreement.

9. DIGITAL SIGNATURES: Both parties acknowledge that electronic signatures on this agreement are legally binding and equivalent to handwritten signatures.

This Agreement constitutes the entire understanding between the parties and supersedes all prior negotiations, understandings, or agreements.
`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-muted/30 text-sm h-64 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans">
          {getAgreementText()}
        </pre>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signature">Your Digital Signature (Full Name)</Label>
          <Textarea 
            id="signature"
            value={customerSignature} 
            onChange={(e) => setCustomerSignature(e.target.value)}
            placeholder="Type your full legal name as your digital signature"
            className="font-handwriting text-lg"
          />
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="agreement" 
            checked={customerAgreed}
            onCheckedChange={(checked) => {
              setCustomerAgreed(checked as boolean);
            }}
          />
          <Label htmlFor="agreement" className="text-sm cursor-pointer">
            I, {customerSignature || "[Your name]"}, have read and agree to the terms of this agreement. 
            I understand that this digital signature constitutes a legally binding acceptance of these terms.
          </Label>
        </div>
      </div>
      
      {submissionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {submissionError}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileSignature className="h-4 w-4" />
              Sign Agreement
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default DepositAgreementForm;
