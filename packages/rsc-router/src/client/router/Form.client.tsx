"use client";

import { useSubmitForm } from "../streams";
import React from "react";

export function ClientForm({
	action,
	...props
}: Omit<React.ComponentProps<"form">, "action"> & {
	action: (formData: FormData) => void;
}) {
	const submitForm = useSubmitForm();
	return (
		<form
			method="post"
			{...props}
			onSubmit={(e) => {
				e.preventDefault();
				submitForm(new FormData(e.currentTarget));
			}}
		>
			{props.children}
		</form>
	);
}
