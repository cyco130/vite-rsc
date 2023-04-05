import { ClientForm } from "./Form.client";
import React from "react";

export function Form({
	action,
	...props
}: Omit<React.ComponentProps<"form">, "action"> & {
	action: (formData: FormData) => void;
}) {
	console.log(action);
	return (
		<ClientForm action={action} {...props}>
			<input name="$$id" hidden={true} value={action.$$id} />
			{props.children}
		</ClientForm>
	);
}
