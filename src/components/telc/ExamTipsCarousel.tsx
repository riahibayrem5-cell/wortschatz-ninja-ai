import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Lightbulb, BookOpen, Headphones, PenTool, Mic, FileText } from "lucide-react";

interface ExamTip {
  id: string;
  section: string;
  sectionIcon: any;
  title: string;
  tip: string;
  example?: string;
  sectionColor: string;
}

const examTips: ExamTip[] = [
  {
    id: "1",
    section: "Leseverstehen",
    sectionIcon: BookOpen,
    title: "Zeit Management",
    tip: "Teilen Sie die 90 Minuten auf: 30 Min. für Teil 1, 35 Min. für Teil 2, 25 Min. für Teil 3. Beginnen Sie mit dem Teil, den Sie am sichersten beherrschen.",
    example: "Teil 1: Überschriften zuordnen → Erst alle Überschriften lesen, dann Texte überfliegen",
    sectionColor: "blue"
  },
  {
    id: "2",
    section: "Leseverstehen",
    sectionIcon: BookOpen,
    title: "Schlüsselwörter markieren",
    tip: "Unterstreichen Sie wichtige Wörter in den Fragen bevor Sie den Text lesen. Suchen Sie dann gezielt nach diesen oder ähnlichen Wörtern im Text.",
    sectionColor: "blue"
  },
  {
    id: "3",
    section: "Hörverstehen",
    sectionIcon: Headphones,
    title: "Aktives Zuhören",
    tip: "Lesen Sie die Fragen während der Pause VOR dem Audio. Konzentrieren Sie sich beim ersten Hören auf das Gesamtverständnis, beim zweiten auf Details.",
    example: "Machen Sie kurze Notizen in Stichpunkten, nicht in ganzen Sätzen",
    sectionColor: "green"
  },
  {
    id: "4",
    section: "Hörverstehen",
    sectionIcon: Headphones,
    title: "'Steht nicht im Text'",
    tip: "Bei 'richtig/falsch/steht nicht im Text' Fragen: 'Steht nicht im Text' bedeutet, dass die Information überhaupt NICHT erwähnt wurde - nicht falsch, sondern gar nicht vorhanden.",
    sectionColor: "green"
  },
  {
    id: "5",
    section: "Sprachbausteine",
    sectionIcon: PenTool,
    title: "Kontext ist König",
    tip: "Lesen Sie immer den ganzen Satz und den Satz danach. Achten Sie besonders auf Präpositionen, Kasus (Dativ/Akkusativ) und Konjunktionen.",
    example: "'wegen' + Genitiv, 'trotz' + Genitiv, 'während' + Genitiv",
    sectionColor: "purple"
  },
  {
    id: "6",
    section: "Schreiben",
    sectionIcon: FileText,
    title: "Brief-Struktur",
    tip: "Formeller Brief: Anrede → Betreff → Einleitung (Bezug) → Hauptteil (Punkte) → Schluss (Bitte/Forderung) → Grußformel. Alle Aufgabenpunkte bearbeiten!",
    example: "Sehr geehrte Damen und Herren, hiermit möchte ich mich über... beschweren.",
    sectionColor: "orange"
  },
  {
    id: "7",
    section: "Schreiben",
    sectionIcon: FileText,
    title: "Konnektoren nutzen",
    tip: "Verwenden Sie Verbindungswörter: erstens, zweitens, darüber hinaus, außerdem, dennoch, trotzdem, deshalb, infolgedessen, abschließend.",
    sectionColor: "orange"
  },
  {
    id: "8",
    section: "Sprechen",
    sectionIcon: Mic,
    title: "Struktur zeigen",
    tip: "Gliedern Sie Ihre Präsentation klar: 'Ich möchte über... sprechen. Erstens... Zweitens... Abschließend möchte ich sagen...'",
    example: "Signalwörter: 'Ein wichtiger Aspekt ist...', 'Darüber hinaus...', 'Zusammenfassend...'",
    sectionColor: "red"
  },
  {
    id: "9",
    section: "Sprechen",
    sectionIcon: Mic,
    title: "Diskussion führen",
    tip: "Reagieren Sie auf Ihren Partner: 'Da stimme ich zu, weil...', 'Das sehe ich anders, denn...', 'Können Sie das näher erläutern?'",
    sectionColor: "red"
  },
  {
    id: "10",
    section: "Allgemein",
    sectionIcon: Lightbulb,
    title: "Prüfungstag",
    tip: "Schlafen Sie gut, essen Sie ein leichtes Frühstück, kommen Sie 30 Minuten früher. Bringen Sie Ihren Ausweis und mehrere Stifte mit.",
    sectionColor: "primary"
  }
];

interface ExamTipsCarouselProps {
  autoRotate?: boolean;
  rotateInterval?: number;
}

export const ExamTipsCarousel = ({ 
  autoRotate = true, 
  rotateInterval = 8000 
}: ExamTipsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoRotate || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examTips.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, isPaused]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % examTips.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + examTips.length) % examTips.length);
  };

  const currentTip = examTips[currentIndex];
  const Icon = currentTip.sectionIcon;

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
    green: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
    red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
    primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  };

  const colors = colorMap[currentTip.sectionColor] || colorMap.primary;

  return (
    <Card 
      className={`glass-luxury ${colors.border} overflow-hidden transition-all duration-500`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colors.bg}`}>
              <Lightbulb className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} mb-1`}>
                <Icon className="w-3 h-3 mr-1" />
                {currentTip.section}
              </Badge>
              <h3 className="font-semibold">{currentTip.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
              {currentIndex + 1} / {examTips.length}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {currentTip.tip}
        </p>

        {currentTip.example && (
          <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
            <p className="text-xs font-medium mb-1">💡 Beispiel:</p>
            <p className="text-sm">{currentTip.example}</p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {examTips.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? `${colors.bg.replace('/10', '')} w-6` 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamTipsCarousel;
