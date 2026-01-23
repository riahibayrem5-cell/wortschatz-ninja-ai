import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Award,
  Pencil,
  Plus,
  Save,
  Trash2,
  ChevronRight,
  Clock,
  Check,
} from 'lucide-react';

interface Module {
  id: string;
  week_number: number;
  title: string;
  title_de: string;
  description: string;
  description_de: string;
  skills_focus: string[];
  estimated_hours: number;
}

interface Lesson {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  title_de: string;
  lesson_type: string;
  estimated_minutes: number;
  content: any;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  points: number;
  badge_color: string;
}

export default function AdminContent() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [modulesRes, lessonsRes, achievementsRes] = await Promise.all([
        supabase.from('course_modules').select('*').order('week_number'),
        supabase.from('course_lessons').select('*').order('lesson_number'),
        supabase.from('achievements').select('*').order('category, requirement'),
      ]);

      setModules((modulesRes.data as Module[]) || []);
      setLessons((lessonsRes.data as Lesson[]) || []);
      setAchievements((achievementsRes.data as Achievement[]) || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveModule = async () => {
    if (!editingModule) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('course_modules')
        .update({
          title: editingModule.title,
          title_de: editingModule.title_de,
          description: editingModule.description,
          description_de: editingModule.description_de,
          estimated_hours: editingModule.estimated_hours,
        })
        .eq('id', editingModule.id);

      if (error) throw error;

      toast({ title: 'Module saved successfully' });
      setEditingModule(null);
      fetchContent();
    } catch (error) {
      console.error('Error saving module:', error);
      toast({ title: 'Error', description: 'Failed to save module', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async () => {
    if (!editingLesson) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('course_lessons')
        .update({
          title: editingLesson.title,
          title_de: editingLesson.title_de,
          lesson_type: editingLesson.lesson_type,
          estimated_minutes: editingLesson.estimated_minutes,
          content: editingLesson.content,
        })
        .eq('id', editingLesson.id);

      if (error) throw error;

      toast({ title: 'Lesson saved successfully' });
      setEditingLesson(null);
      fetchContent();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({ title: 'Error', description: 'Failed to save lesson', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveAchievement = async () => {
    if (!editingAchievement) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('achievements')
        .update({
          name: editingAchievement.name,
          description: editingAchievement.description,
          icon: editingAchievement.icon,
          category: editingAchievement.category,
          requirement: editingAchievement.requirement,
          points: editingAchievement.points,
          badge_color: editingAchievement.badge_color,
        })
        .eq('id', editingAchievement.id);

      if (error) throw error;

      toast({ title: 'Achievement saved successfully' });
      setEditingAchievement(null);
      fetchContent();
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({ title: 'Error', description: 'Failed to save achievement', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{modules.length}</p>
                <p className="text-sm text-muted-foreground">Course Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <ChevronRight className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lessons.length}</p>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules">
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Course Modules</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Course Modules & Lessons</CardTitle>
              <CardDescription>Edit module content and manage lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Accordion type="single" collapsible className="space-y-4">
                  {modules.map((module) => {
                    const moduleLessons = lessons.filter(l => l.module_id === module.id);
                    return (
                      <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-4 text-left">
                            <Badge variant="outline">Week {module.week_number}</Badge>
                            <div>
                              <p className="font-medium">{module.title}</p>
                              <p className="text-sm text-muted-foreground">{module.title_de}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 mr-4">
                              <Badge variant="secondary">{moduleLessons.length} lessons</Badge>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.estimated_hours}h
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                              <Button variant="outline" size="sm" onClick={() => setEditingModule(module)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Module
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {moduleLessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {lesson.lesson_number}.
                                    </span>
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                      <p className="text-sm text-muted-foreground">{lesson.title_de}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{lesson.lesson_type}</Badge>
                                    <Badge variant="outline">{lesson.estimated_minutes}min</Badge>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Manage achievement badges and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${achievement.badge_color || 'primary'}/10`}>
                            <span className="text-2xl">{achievement.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium">{achievement.name}</p>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEditingAchievement(achievement)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{achievement.category}</Badge>
                        <Badge variant="secondary">Req: {achievement.requirement}</Badge>
                        <Badge variant="secondary">{achievement.points} pts</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module information</DialogDescription>
          </DialogHeader>
          {editingModule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title (EN)</label>
                  <Input
                    value={editingModule.title}
                    onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title (DE)</label>
                  <Input
                    value={editingModule.title_de}
                    onChange={(e) => setEditingModule({ ...editingModule, title_de: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description (EN)</label>
                <Textarea
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (DE)</label>
                <Textarea
                  value={editingModule.description_de}
                  onChange={(e) => setEditingModule({ ...editingModule, description_de: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  type="number"
                  value={editingModule.estimated_hours}
                  onChange={(e) => setEditingModule({ ...editingModule, estimated_hours: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingModule(null)}>Cancel</Button>
            <Button onClick={saveModule} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update lesson content</DialogDescription>
          </DialogHeader>
          {editingLesson && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title (EN)</label>
                  <Input
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title (DE)</label>
                  <Input
                    value={editingLesson.title_de}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title_de: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Lesson Type</label>
                  <Input
                    value={editingLesson.lesson_type}
                    onChange={(e) => setEditingLesson({ ...editingLesson, lesson_type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Minutes</label>
                  <Input
                    type="number"
                    value={editingLesson.estimated_minutes}
                    onChange={(e) => setEditingLesson({ ...editingLesson, estimated_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Content (JSON)</label>
                <Textarea
                  value={JSON.stringify(editingLesson.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const content = JSON.parse(e.target.value);
                      setEditingLesson({ ...editingLesson, content });
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
            <Button onClick={saveLesson} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Achievement Dialog */}
      <Dialog open={!!editingAchievement} onOpenChange={(open) => !open && setEditingAchievement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
            <DialogDescription>Update achievement details</DialogDescription>
          </DialogHeader>
          {editingAchievement && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editingAchievement.name}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingAchievement.description}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Icon (Emoji)</label>
                  <Input
                    value={editingAchievement.icon}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={editingAchievement.category}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Requirement</label>
                  <Input
                    type="number"
                    value={editingAchievement.requirement}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, requirement: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Points</label>
                  <Input
                    type="number"
                    value={editingAchievement.points}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, points: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAchievement(null)}>Cancel</Button>
            <Button onClick={saveAchievement} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
