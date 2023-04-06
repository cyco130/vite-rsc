"use client";

import React from "react";
import * as Form from "@radix-ui/react-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSubmitForm } from "rsc-router";

export const FormDemo = ({ children }: { children: React.ReactNode }) => {
	const submitForm = useSubmitForm();

	return (
		<Form.Root
			className="w-[260px]"
			method="post"
			onSubmit={(e) => {
				e.preventDefault();
				submitForm(new FormData(e.currentTarget));
			}}
		>
			{children}
			<Form.Field className="grid mb-[10px]" name="email">
				<div className="flex items-baseline justify-between">
					<Form.Label className="text-[15px] font-medium leading-[35px] ">
						Email
					</Form.Label>
					<Form.Message
						className="text-[13px] opacity-[0.8]"
						match="valueMissing"
					>
						Please enter your email
					</Form.Message>
					<Form.Message
						className="text-[13px] opacity-[0.8]"
						match="typeMismatch"
					>
						Please provide a valid email
					</Form.Message>
				</div>
				<Form.Control asChild>
					<Input type="email" required />
				</Form.Control>
			</Form.Field>
			<Form.Field className="grid mb-[10px]" name="question">
				<div className="flex items-baseline justify-between">
					<Form.Label className="text-[15px] font-medium leading-[35px]">
						Question
					</Form.Label>
					<Form.Message
						className="text-[13px] opacity-[0.8]"
						match="valueMissing"
					>
						Please enter a question
					</Form.Message>
				</div>
				<Form.Control asChild>
					<Textarea required />
				</Form.Control>
			</Form.Field>
			<Form.Submit asChild>
				<Button>Post question</Button>
			</Form.Submit>
		</Form.Root>
	);
};

export default FormDemo;
