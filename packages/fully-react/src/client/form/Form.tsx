import { ClientForm } from "./Form.client";
import React from "react";

export function FormAction({
	action,
}: {
	action: ((formData: FormData) => void) & { $$id?: string };
}) {
	return (
		<input name="$$id" hidden={true} value={action.$$id} readOnly={true} />
	);
}

export function Form({
	action,
	...props
}: Omit<React.ComponentProps<"form">, "action"> & {
	action: (formData: FormData) => void;
}) {
	return (
		<ClientForm {...props}>
			<FormAction action={action} />
			{props.children}
		</ClientForm>
	);
}

Form.Action = FormAction;
