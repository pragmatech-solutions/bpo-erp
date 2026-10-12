'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const labelClass = 'text-[14px] font-medium text-[#313957]';

type FieldProps = {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	type?: string;
	maxLength?: number;
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
	hint?: string;
};

export function InsellerateField({
	id,
	label,
	value,
	onChange,
	required,
	hint,
	...inputProps
}: FieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className={labelClass}>
				{label}
				{required ? ' *' : ''}
			</Label>
			<Input
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				className="h-[52px] rounded-[12px] border-[#D4D7E3] bg-white text-[15px] text-[#313957]"
				{...inputProps}
			/>
			{hint ? <p className="text-[12px] text-[#8897AD]">{hint}</p> : null}
		</div>
	);
}

type SelectFieldProps = {
	id: string;
	label: string;
	value: string;
	placeholder: string;
	options: readonly { value: string; label: string }[];
	onChange: (value: string) => void;
	required?: boolean;
};

export function InsellerateSelectField({
	id,
	label,
	value,
	placeholder,
	options,
	onChange,
	required,
}: SelectFieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className={labelClass}>
				{label}
				{required ? ' *' : ''}
			</Label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id={id}
					className="h-[52px] rounded-[12px] border-[#D4D7E3] bg-white px-4 text-[15px] text-[#313957]"
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
