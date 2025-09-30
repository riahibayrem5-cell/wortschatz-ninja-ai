import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type Difficulty = 'A2' | 'B1' | 'B2' | 'B2+';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
  label?: string;
  disabled?: boolean;
}

export const DifficultySelector = ({ 
  value, 
  onChange, 
  label = "Difficulty Level",
  disabled = false 
}: DifficultySelectorProps) => {
  const difficultyInfo = {
    'A2': { name: 'A2 - Elementary', description: 'Basic phrases and simple conversations' },
    'B1': { name: 'B1 - Intermediate', description: 'Everyday situations and familiar topics' },
    'B2': { name: 'B2 - Upper Intermediate', description: 'Complex texts and abstract topics' },
    'B2+': { name: 'B2+ - Advanced', description: 'Sophisticated language and nuanced expression' }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as Difficulty)} disabled={disabled}>
        <SelectTrigger className="bg-background/50">
          <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(difficultyInfo).map(([key, info]) => (
            <SelectItem key={key} value={key}>
              <div className="flex flex-col">
                <span className="font-medium">{info.name}</span>
                <span className="text-xs text-muted-foreground">{info.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
