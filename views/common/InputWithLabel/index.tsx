import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HTMLInputTypeAttribute } from "react";

interface IInputWithLabelProps {
  label: string;
  id: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
}

export function InputWithLabel({
  label,
  id,
  type,
  placeholder,
}: IInputWithLabelProps) {
  return (
    <div className="grid w-full gap-3 items-center">
      <Label htmlFor={id}>
        <span>{label}</span>
        <span className="text-primary font-semibold ml-1">*</span>
      </Label>
      <Input
        type={type}
        id={id}
        placeholder={placeholder}
        className="h-12 bg-tabs-trigger"
      />
    </div>
  );
}
