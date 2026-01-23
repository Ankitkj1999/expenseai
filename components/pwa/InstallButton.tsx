'use client';

import { IconDownload } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallButton() {
  const { isInstallable, isInstalled, handleInstallClick } = usePWAInstall();

  // Don't show button if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
    >
      <IconDownload className="h-4 w-4" />
      <span>Install App</span>
    </Button>
  );
}
