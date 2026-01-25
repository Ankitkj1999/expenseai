'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onSuccess: () => void;
}

interface AnalysisResult {
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    newCategories: string[];
    newAccounts: string[];
  };
  details: {
    invalid: { index: number; errors: string[] }[];
  };
  rawParsedData: any[]; // Data to send back
}

export function ImportDialog({ open, onOpenChange, file, onSuccess }: ImportDialogProps) {
  const [step, setStep] = useState<'analyzing' | 'review' | 'importing'>('analyzing');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  // Options
  const [createCategories, setCreateCategories] = useState(false);
  const [createAccounts, setCreateAccounts] = useState(false);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'allow'>('skip');

  // Effect to trigger analysis when opens with file
  useState(() => {
    if (open && file && step === 'analyzing' && !analysis) {
      analyzeFile();
    }
  });

  async function analyzeFile() {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import-export/import/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to analyze file');
      
      const data = await res.json();
      setAnalysis(data);
      setStep('review');
    } catch (error) {
      toast.error('Failed to analyze file. Please check the format.');
      onOpenChange(false);
    }
  }

  async function handleImport() {
    if (!analysis) return;

    setStep('importing');
    try {
      const res = await fetch('/api/import-export/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: analysis.rawParsedData,
          options: {
            createMissingCategories: createCategories,
            createMissingAccounts: createAccounts,
            duplicateStrategy
          }
        })
      });

      if (!res.ok) throw new Error('Import failed');

      const result = await res.json();
      toast.success(`Imported ${result.result.created} transactions successfully!`);
      // Optionally show skipped/errors too
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Import failed. Please try again.');
      setStep('review');
    }
  }

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Processing {file.name}
          </DialogDescription>
        </DialogHeader>

        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing file contents...</p>
          </div>
        )}

        {step === 'review' && analysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-2xl font-bold">{analysis.summary.validRecords}</div>
                <div className="text-xs text-muted-foreground">Valid Records</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analysis.summary.newCategories.length}</div>
                <div className="text-xs text-muted-foreground">New Categories</div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analysis.summary.invalidRecords}</div>
                <div className="text-xs text-muted-foreground">Invalid Records</div>
              </div>
            </div>

            {/* Warnings Area */}
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-4">
                {analysis.summary.newCategories.length > 0 && (
                  <Alert className="border-yellow-500 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Unknown Categories Found</AlertTitle>
                    <AlertDescription>
                      The following categories are not in your system:
                      <div className="mt-2 font-mono text-xs">
                        {analysis.summary.newCategories.join(', ')}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.summary.newAccounts.length > 0 && (
                  <Alert className="border-yellow-500 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Unknown Accounts Found</AlertTitle>
                    <AlertDescription>
                      The following accounts are not in your system:
                      <div className="mt-2 font-mono text-xs">
                        {analysis.summary.newAccounts.join(', ')}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {analysis.summary.invalidRecords > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Invalid Records</AlertTitle>
                    <AlertDescription>
                      {analysis.summary.invalidRecords} rows have errors and will be skipped.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>

            {/* Options */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Create Missing Categories</Label>
                  <p className="text-xs text-muted-foreground">Automatically create new categories found in file</p>
                </div>
                <Switch 
                  checked={createCategories}
                  onCheckedChange={setCreateCategories}
                  disabled={analysis.summary.newCategories.length === 0}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Create Missing Accounts</Label>
                  <p className="text-xs text-muted-foreground">Automatically create new accounts found in file</p>
                </div>
                <Switch 
                  checked={createAccounts}
                  onCheckedChange={setCreateAccounts}
                  disabled={analysis.summary.newAccounts.length === 0}
                />
              </div>

               <div className="space-y-2">
                <Label>Duplicate Strategy</Label>
                <RadioGroup 
                  value={duplicateStrategy} 
                  onValueChange={(val: string) => setDuplicateStrategy(val as 'skip' | 'allow')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip">Skip duplicates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="allow" id="allow" />
                    <Label htmlFor="allow">Import anyway</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {step === 'importing' && (
           <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Importing transactions...</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={step === 'importing'}>
            Cancel
          </Button>
          {step === 'review' && (
            <Button onClick={handleImport}>
              Import Valid Records
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
