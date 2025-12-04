import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Award, Download, Share2, CheckCircle2, 
  GraduationCap, Star, Calendar, Shield
} from "lucide-react";

interface Certificate {
  id: string;
  certificate_type: string;
  title: string;
  description: string;
  issued_at: string;
  certificate_data: any;
  verification_code: string;
}

const Certificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await fetchCertificates(user.id);
    setLoading(false);
  };

  const fetchCertificates = async (userId: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error("Error fetching certificates:", error);
      return;
    }

    setCertificates(data || []);
  };

  const downloadCertificate = async (certificate: Certificate) => {
    // Create a simple certificate image/PDF
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 850);
    gradient.addColorStop(0, '#fef3e2');
    gradient.addColorStop(1, '#fde8d0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 850);

    // Border
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1120, 770);

    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, 1090, 740);

    // Header
    ctx.fillStyle = '#8b4513';
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('FluentPass', 600, 120);

    ctx.font = '24px Georgia';
    ctx.fillStyle = '#666';
    ctx.fillText('TELC B2 Mastery Course', 600, 160);

    // Certificate of text
    ctx.fillStyle = '#333';
    ctx.font = '32px Georgia';
    ctx.fillText('Certificate of Achievement', 600, 240);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(350, 260);
    ctx.lineTo(850, 260);
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2;
    ctx.stroke();

    // This certifies
    ctx.font = '20px Georgia';
    ctx.fillStyle = '#666';
    ctx.fillText('This is to certify that', 600, 320);

    // Name
    ctx.font = 'bold 40px Georgia';
    ctx.fillStyle = '#8b4513';
    ctx.fillText(certificate.certificate_data.userName || 'Student', 600, 380);

    // Achievement text
    ctx.font = '20px Georgia';
    ctx.fillStyle = '#666';
    ctx.fillText('has successfully completed', 600, 440);

    // Title
    ctx.font = 'bold 28px Georgia';
    ctx.fillStyle = '#333';
    const titleLines = certificate.title.length > 50 
      ? [certificate.title.slice(0, 50), certificate.title.slice(50)]
      : [certificate.title];
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, 600, 490 + idx * 35);
    });

    // Score if available
    if (certificate.certificate_data.averageScore) {
      ctx.font = '20px Georgia';
      ctx.fillStyle = '#666';
      ctx.fillText(`with an average score of ${certificate.certificate_data.averageScore}%`, 600, 560);
    }

    // Date
    ctx.font = '18px Georgia';
    ctx.fillStyle = '#666';
    const date = new Date(certificate.issued_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillText(`Issued on ${date}`, 600, 620);

    // Verification code
    ctx.font = '14px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText(`Verification Code: ${certificate.verification_code}`, 600, 750);

    // Download
    const link = document.createElement('a');
    link.download = `FluentPass-Certificate-${certificate.verification_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success("Certificate downloaded!");
  };

  const shareCertificate = async (certificate: Certificate) => {
    const shareText = `I just earned "${certificate.title}" from FluentPass TELC B2 Mastery Course! Verification code: ${certificate.verification_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FluentPass Certificate',
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Certificate info copied to clipboard!");
    }
  };

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case 'course_completion':
        return <GraduationCap className="h-8 w-8 text-primary" />;
      case 'excellence':
        return <Star className="h-8 w-8 text-yellow-500" />;
      case 'module_completion':
        return <Award className="h-8 w-8 text-blue-500" />;
      default:
        return <Award className="h-8 w-8 text-primary" />;
    }
  };

  const getCertificateBadge = (type: string) => {
    switch (type) {
      case 'course_completion':
        return <Badge className="bg-primary">Course Completion</Badge>;
      case 'excellence':
        return <Badge className="bg-yellow-500">Excellence Award</Badge>;
      case 'module_completion':
        return <Badge variant="secondary">Module Certificate</Badge>;
      default:
        return <Badge variant="outline">Certificate</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(i => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Certificates</h1>
          </div>
          <p className="text-muted-foreground">
            Your earned certificates and achievements from the FluentPass Mastery Course
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete modules in the Mastery Course to earn certificates!
              </p>
              <Button onClick={() => navigate('/mastery-course')}>
                Go to Mastery Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                  <div className="flex items-start justify-between">
                    {getCertificateIcon(cert.certificate_type)}
                    {getCertificateBadge(cert.certificate_type)}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-1">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{cert.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs">{cert.verification_code}</span>
                    </div>
                    {cert.certificate_data.averageScore && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Score: {cert.certificate_data.averageScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => downloadCertificate(cert)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => shareCertificate(cert)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* How to Earn More */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How to Earn Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <Award className="h-6 w-6 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Module Certificates</p>
                  <p className="text-sm text-muted-foreground">
                    Complete all lessons in a module
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Course Completion</p>
                  <p className="text-sm text-muted-foreground">
                    Complete all 12 modules
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <Star className="h-6 w-6 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Excellence Award</p>
                  <p className="text-sm text-muted-foreground">
                    Achieve 90%+ average score
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certificates;
