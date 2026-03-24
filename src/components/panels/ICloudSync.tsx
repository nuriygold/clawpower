import { Cloud, CheckCircle, HardDrive } from 'lucide-react';
import { PanelWrapper } from './PanelWrapper';

export function ICloudSync() {
  return (
    <PanelWrapper title="iCloud Sync" icon={<Cloud className="h-5 w-5 text-primary" />}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="text-sm text-foreground">Process Running</span>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Folder</span>
            <span className="font-mono text-foreground text-xs">~/iCloud/Photos/2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last File</span>
            <span className="font-mono text-foreground text-xs">IMG_4821.HEIC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <HardDrive className="h-3 w-3" /> PhotoSSD
            </span>
            <span className="font-mono text-foreground text-xs">847 GB used / 153 GB free</span>
          </div>
        </div>
      </div>
    </PanelWrapper>
  );
}
