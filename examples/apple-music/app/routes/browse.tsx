import { Button } from "@/components/ui/button";
import { getCount, increment } from "../actions";
import { A, Form } from "rsc-router";
import FormDemo from "../form";

export default async function Browse() {
	return (
		<div>
			<Form action={increment}>
				<div>{await getCount()}</div>
				<Button>Increment</Button>
			</Form>
			<FormDemo>
				<Form.ActionId action={increment} />
			</FormDemo>
			<A
				to=""
				search={{
					page: 1,
				}}
			/>
		</div>
	);
}
