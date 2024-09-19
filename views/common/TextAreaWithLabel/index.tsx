import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ITextAreaWithLabelProps {
  label: string;
  id: string;
  placeholder?: string;
}

export default function TextAreaWithLabel({
  label,
  id,
  placeholder,
}: ITextAreaWithLabelProps) {
  return (
    <div className="grid w-full gap-3 items-center">
      <Label htmlFor={id}>
        <span>{label}</span>
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        className="h-12 bg-tabs-trigger"
      />
    </div>
  );
}
