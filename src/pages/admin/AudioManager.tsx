import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Music,
  Search,
  Trash2,
  Download,
  Play,
  Pause,
  RefreshCw,
  HardDrive,
  FileAudio,
  Calendar,
  Volume2,
} from 'lucide-react';
import { format } from 'date-fns';

interface AudioFile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  metadata: {
    size?: number;
    mimetype?: string;
  };
}

export default function AdminAudioManager() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalSize, setTotalSize] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [deleteFile, setDeleteFile] = useState<AudioFile | null>(null);
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAudioFiles();
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  const fetchAudioFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('audio-cache')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const filesWithMetadata = (data || []).map(file => ({
        id: file.name,
        name: file.name,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        metadata: file.metadata || {},
      }));

      setFiles(filesWithMetadata);
      
      // Calculate total size
      const total = filesWithMetadata.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
      setTotalSize(total);
    } catch (error) {
      console.error('Error fetching audio files:', error);
      toast({ title: 'Error', description: 'Failed to fetch audio files', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePlay = async (file: AudioFile) => {
    if (playingId === file.id) {
      audioElement?.pause();
      setPlayingId(null);
      return;
    }

    try {
      // Stop current audio
      if (audioElement) {
        audioElement.pause();
      }

      // Get public URL
      const { data } = supabase.storage
        .from('audio-cache')
        .getPublicUrl(file.name);

      const audio = new Audio(data.publicUrl);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        toast({ title: 'Error', description: 'Failed to play audio', variant: 'destructive' });
        setPlayingId(null);
      };
      
      await audio.play();
      setAudioElement(audio);
      setPlayingId(file.id);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({ title: 'Error', description: 'Failed to play audio', variant: 'destructive' });
    }
  };

  const handleDownload = async (file: AudioFile) => {
    try {
      const { data } = supabase.storage
        .from('audio-cache')
        .getPublicUrl(file.name);

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = file.name;
      link.click();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download file', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteFile) return;

    try {
      const { error } = await supabase.storage
        .from('audio-cache')
        .remove([deleteFile.name]);

      if (error) throw error;

      toast({ title: 'Deleted', description: `${deleteFile.name} has been deleted` });
      setDeleteFile(null);
      fetchAudioFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({ title: 'Error', description: 'Failed to delete file', variant: 'destructive' });
    }
  };

  const handleBulkDelete = async (olderThanDays: number) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const filesToDelete = files.filter(f => new Date(f.created_at) < cutoffDate);
      
      if (filesToDelete.length === 0) {
        toast({ title: 'No files', description: 'No files older than ' + olderThanDays + ' days' });
        return;
      }

      const { error } = await supabase.storage
        .from('audio-cache')
        .remove(filesToDelete.map(f => f.name));

      if (error) throw error;

      toast({ 
        title: 'Bulk Delete Complete', 
        description: `Deleted ${filesToDelete.length} files older than ${olderThanDays} days` 
      });
      fetchAudioFiles();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({ title: 'Error', description: 'Failed to delete files', variant: 'destructive' });
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileAudio className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{files.length}</p>
                <p className="text-sm text-muted-foreground">Total Audio Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <HardDrive className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                <p className="text-sm text-muted-foreground">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {files.filter(f => {
                    const date = new Date(f.created_at);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Added Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Volume2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatFileSize(totalSize / (files.length || 1))}
                </p>
                <p className="text-sm text-muted-foreground">Avg File Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audio files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchAudioFiles} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => handleBulkDelete(30)} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete 30+ Days Old
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Audio Cache Files
          </CardTitle>
          <CardDescription>
            TTS-generated audio files stored for caching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-mono text-sm max-w-md truncate">
                      {file.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatFileSize(file.metadata?.size || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(file.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlay(file)}
                        >
                          {playingId === file.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteFile(file)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No audio files found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteFile?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
